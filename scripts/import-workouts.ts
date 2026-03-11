/**
 * import-workouts.ts
 *
 * Parses Trainerize CSV exports from ~/Downloads/FitnessExports/
 * and imports them into the LifeOS Supabase database.
 *
 * Usage:
 *   Dry run (default):  npx ts-node --project scripts/tsconfig.json scripts/import-workouts.ts
 *   Actually import:    npx ts-node --project scripts/tsconfig.json scripts/import-workouts.ts --import
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DRY_RUN = !process.argv.includes('--import');
const CSV_DIR = path.join(os.homedir(), 'Downloads', 'FitnessExports');

// ── Exercise name mapping: Trainerize → our DB ──────────────────────────────

const EXERCISE_NAME_MAP: Record<string, string> = {
  'Dumbbell Bench Press': 'Dumbbell Press',
  'Cable Lateral Raise': 'Lateral Raise',
  // 'Cable Bicep Curl' stays the same
};

// Exercises to create with explicit metadata (name is the Trainerize name)
const EXPLICIT_NEW_EXERCISES: Record<string, { category: string; equipment: string }> = {
  'Dumbbell Hammer Curl': { category: 'pull', equipment: 'dumbbell' },
  'Machine Seated Chest Fly': { category: 'push', equipment: 'machine' },
  'Machine Seated Shoulder Press': { category: 'push', equipment: 'machine' },
};

// ── Category / equipment inference for unknown exercises ────────────────────

function inferEquipment(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dumbbell')) return 'dumbbell';
  if (n.includes('cable')) return 'cable';
  if (n.includes('machine') || n.includes('seated') || n.includes('angled')) return 'machine';
  if (n.includes('barbell') || n.includes('romanian')) return 'barbell';
  if (n.includes('smith machine')) return 'barbell';
  if (n.includes('plate')) return 'plate';
  if (n.includes('bodyweight') || n.includes('pull up') || n.includes('push up') || n.includes('dip')) return 'bodyweight';
  return 'other';
}

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (/squat|leg press|leg curl|leg extension|calf|hip adduction|hip abduction|lunge|glute|leg press|romanian deadlift/.test(n)) return 'legs';
  if (/curl|row|pull|deadlift|shrug|rear delt|chin|face pull/.test(n)) return 'pull';
  if (/press|fly|raise|pushdown|dip|tricep|push up/.test(n)) return 'push';
  return 'other';
}

// ── Parsed data structures ───────────────────────────────────────────────────

interface ParsedSet {
  exerciseRawName: string; // as it appears in CSV
  setNumber: number;
  reps: number;
  weight_kg: number;
}

interface ParsedWorkout {
  sourceFile: string;
  date: Date;
  dateStr: string; // original date string from CSV
  sets: ParsedSet[];
}

interface SkippedRow {
  file: string;
  row: number;
  reason: string;
  content: string;
}

// ── Parsing helpers ──────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date | null {
  if (!dateStr?.trim()) return null;
  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) return null;
  return d;
}

function parseSetCell(cell: string): { reps: number; weight_kg: number } | null {
  if (!cell?.trim()) return null;
  // Matches "8 X 32.5 kg", "10 X 5 kg", "12 X 65 kg"
  const match = cell.trim().match(/^(\d+)\s*[Xx]\s*([\d.]+)\s*kg/i);
  if (!match) return null;
  const reps = parseInt(match[1], 10);
  const weight_kg = parseFloat(match[2]);
  if (isNaN(reps) || isNaN(weight_kg) || reps <= 0 || weight_kg <= 0) return null;
  return { reps, weight_kg };
}

function parseSetNumber(setLabel: string): number {
  const match = setLabel.match(/SET\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

// ── CSV file parser ──────────────────────────────────────────────────────────

function parseCSVFile(filePath: string, skipped: SkippedRow[]): ParsedWorkout[] {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  const rows: string[][] = parse(content, {
    relax_column_count: true,
    skip_empty_lines: false,
  });

  if (rows.length < 6) {
    skipped.push({ file: fileName, row: 0, reason: 'File too short (< 6 rows)', content: '' });
    return [];
  }

  // Row index 2: date headers. Col 0-1 are labels, last col is "false".
  const dateRow = rows[2];
  const dateCols: Array<{ colIdx: number; date: Date; dateStr: string }> = [];

  for (let c = 2; c < dateRow.length - 1; c++) {
    const dateStr = dateRow[c]?.trim();
    if (!dateStr || dateStr.toLowerCase() === 'false') continue;
    const date = parseDate(dateStr);
    if (date) {
      dateCols.push({ colIdx: c, date, dateStr });
    } else {
      skipped.push({ file: fileName, row: 2, reason: `Could not parse date: "${dateStr}"`, content: dateStr });
    }
  }

  if (dateCols.length === 0) return [];

  // Map: colIdx → exercise name → list of ParsedSet
  const workoutData = new Map<number, Map<string, ParsedSet[]>>();
  dateCols.forEach(d => workoutData.set(d.colIdx, new Map()));

  let currentExercise = '';

  // Exercise rows start at index 5 (0=name, 1=dates, 2=dates, 3=RPE, 4=Comments, 5+=exercises)
  for (let r = 5; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 2) continue;

    const rawExName = row[0]?.trim();
    const setLabel = row[1]?.trim();

    if (rawExName) {
      currentExercise = rawExName;
    }

    if (!currentExercise || !setLabel) continue;
    if (!setLabel.toUpperCase().startsWith('SET')) continue;

    const setNumber = parseSetNumber(setLabel);

    for (const { colIdx } of dateCols) {
      const cell = row[colIdx]?.trim() ?? '';
      const parsed = parseSetCell(cell);

      if (!parsed) {
        if (cell && cell !== '' && cell.toLowerCase() !== 'false') {
          // Has content but couldn't parse (e.g. "- X - kg", "3 X - kg")
          skipped.push({
            file: fileName,
            row: r + 1,
            reason: `Unparseable set data: "${cell}" for exercise "${currentExercise}" ${setLabel}`,
            content: cell,
          });
        }
        continue;
      }

      const exMap = workoutData.get(colIdx)!;
      if (!exMap.has(currentExercise)) {
        exMap.set(currentExercise, []);
      }
      exMap.get(currentExercise)!.push({
        exerciseRawName: currentExercise,
        setNumber,
        reps: parsed.reps,
        weight_kg: parsed.weight_kg,
      });
    }
  }

  // Convert to ParsedWorkout[]
  const workouts: ParsedWorkout[] = [];
  for (const { colIdx, date, dateStr } of dateCols) {
    const exMap = workoutData.get(colIdx)!;
    const allSets: ParsedSet[] = [];
    exMap.forEach(sets => allSets.push(...sets));

    if (allSets.length > 0) {
      workouts.push({ sourceFile: fileName, date, dateStr, sets: allSets });
    }
  }

  return workouts;
}

// ── Exercise resolution ──────────────────────────────────────────────────────

interface ExerciseRecord {
  id: string;
  name: string;
  isNew: boolean;
}

async function resolveExercises(
  rawNames: Set<string>,
  userId: string,
  dryRun: boolean
): Promise<Map<string, ExerciseRecord>> {
  // Fetch existing exercises from DB
  const { data: existing } = await supabase
    .from('exercises')
    .select('id, name')
    .eq('user_id', userId);

  const dbExercises = (existing ?? []) as Array<{ id: string; name: string }>;
  const dbByName = new Map(dbExercises.map(e => [e.name.toLowerCase(), e]));

  const result = new Map<string, ExerciseRecord>();
  let nextOrder = dbExercises.length + 13; // after existing seeded exercises

  for (const rawName of rawNames) {
    // 1. Check explicit mapping
    const mappedName = EXERCISE_NAME_MAP[rawName] ?? rawName;

    // 2. Check if mapped name already exists in DB
    const existing = dbByName.get(mappedName.toLowerCase());
    if (existing) {
      result.set(rawName, { id: existing.id, name: mappedName, isNew: false });
      continue;
    }

    // 3. Determine metadata for new exercise
    let category: string;
    let equipment: string;

    if (EXPLICIT_NEW_EXERCISES[rawName]) {
      category = EXPLICIT_NEW_EXERCISES[rawName].category;
      equipment = EXPLICIT_NEW_EXERCISES[rawName].equipment;
    } else {
      category = inferCategory(mappedName);
      equipment = inferEquipment(mappedName);
    }

    if (dryRun) {
      // In dry run, generate a fake UUID for display purposes
      result.set(rawName, {
        id: `[NEW:${mappedName}]`,
        name: mappedName,
        isNew: true,
      });
      console.log(`  → Would CREATE exercise: "${mappedName}" (${category}, ${equipment})`);
    } else {
      const { data: created, error } = await supabase
        .from('exercises')
        .insert({
          user_id: userId,
          name: mappedName,
          category,
          equipment,
          is_primary: false,
          display_order: nextOrder++,
          active: true,
        } as never)
        .select('id, name')
        .single();

      if (error || !created) {
        console.error(`  ERROR creating exercise "${mappedName}":`, error?.message);
        continue;
      }

      const createdRow = created as { id: string; name: string };
      result.set(rawName, { id: createdRow.id, name: createdRow.name, isNew: true });
      dbByName.set(createdRow.name.toLowerCase(), createdRow);
      console.log(`  ✓ Created exercise: "${createdRow.name}" (${category}, ${equipment})`);
    }
  }

  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log(`  LIFEOS WORKOUT IMPORTER  ${DRY_RUN ? '[DRY RUN]' : '[LIVE IMPORT]'}`);
  console.log('══════════════════════════════════════════════════');
  console.log('');

  // Get user ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .limit(1)
    .single();

  if (userError || !userData) {
    console.error('Could not find user in DB:', userError?.message);
    process.exit(1);
  }

  const user = userData as { id: string; email: string };
  console.log(`User: ${user.email} (${user.id})`);
  console.log('');

  // Find CSV files — deduplicate by content hash (Trainerize re-downloads create numbered copies)
  const allFiles = fs
    .readdirSync(CSV_DIR)
    .filter(f => f.endsWith('.csv'))
    .map(f => path.join(CSV_DIR, f))
    .sort();

  const seenHashes = new Set<string>();
  const csvFiles: string[] = [];
  for (const f of allFiles) {
    const hash = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      csvFiles.push(f);
    }
  }

  const dupCount = allFiles.length - csvFiles.length;
  console.log(`Found ${allFiles.length} CSV files in ${CSV_DIR}`);
  if (dupCount > 0) {
    console.log(`  (${dupCount} duplicate files removed by content hash)`);
  }
  console.log('');

  // Parse all files
  const skipped: SkippedRow[] = [];
  const allWorkouts: ParsedWorkout[] = [];

  for (const filePath of csvFiles) {
    const fileName = path.basename(filePath);
    const workouts = parseCSVFile(filePath, skipped);
    allWorkouts.push(...workouts);
    const totalSets = workouts.reduce((s, w) => s + w.sets.length, 0);
    console.log(`  ${fileName}: ${workouts.length} workout sessions, ${totalSets} sets`);
  }

  console.log('');
  console.log(`Total: ${allWorkouts.length} workout sessions across all files`);
  console.log('');

  // Collect all unique raw exercise names
  const allRawNames = new Set<string>();
  for (const w of allWorkouts) {
    for (const s of w.sets) {
      allRawNames.add(s.exerciseRawName);
    }
  }

  console.log(`Unique exercises found in CSVs: ${allRawNames.size}`);
  console.log('');
  console.log('Resolving exercises against DB...');

  const exerciseMap = await resolveExercises(allRawNames, user.id, DRY_RUN);

  const newExCount = [...exerciseMap.values()].filter(e => e.isNew).length;

  console.log('');
  console.log('── WORKOUT PLAN ──────────────────────────────────');
  console.log('');

  let totalSetsCount = 0;
  let skippedWorkouts = 0;

  for (const workout of allWorkouts) {
    const dateLabel = workout.date.toISOString().split('T')[0];
    const validSets = workout.sets.filter(s => exerciseMap.has(s.exerciseRawName));
    const totalVolume = validSets.reduce((s, set) => s + set.weight_kg * set.reps, 0);

    if (validSets.length === 0) {
      skippedWorkouts++;
      continue;
    }

    totalSetsCount += validSets.length;

    console.log(`  ${dateLabel}  (${workout.sourceFile})`);

    // Group by exercise
    const byExercise = new Map<string, ParsedSet[]>();
    for (const s of validSets) {
      if (!byExercise.has(s.exerciseRawName)) byExercise.set(s.exerciseRawName, []);
      byExercise.get(s.exerciseRawName)!.push(s);
    }

    byExercise.forEach((sets, rawName) => {
      const ex = exerciseMap.get(rawName)!;
      const mappedLabel = ex.name !== rawName ? ` → "${ex.name}"` : '';
      const newLabel = ex.isNew ? ' [NEW]' : '';
      console.log(`    ${rawName}${mappedLabel}${newLabel}`);
      sets.forEach(s => {
        const est1rm = (s.weight_kg * (1 + s.reps / 30)).toFixed(1);
        console.log(`      Set ${s.setNumber}: ${s.reps} × ${s.weight_kg}kg  (1RM est: ${est1rm}kg)`);
      });
    });

    console.log(`    Volume: ${totalVolume.toFixed(1)}kg`);
    console.log('');
  }

  // Skipped rows summary
  if (skipped.length > 0) {
    console.log('── SKIPPED ROWS ─────────────────────────────────');
    console.log('');
    for (const s of skipped) {
      console.log(`  [${s.file}] Row ${s.row}: ${s.reason}`);
    }
    console.log('');
  }

  // Summary
  console.log('══════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('══════════════════════════════════════════════════');
  console.log(`  CSV files processed:    ${csvFiles.length}`);
  console.log(`  Workout sessions found: ${allWorkouts.length}`);
  console.log(`  Workouts to import:     ${allWorkouts.length - skippedWorkouts}`);
  console.log(`  Sets to import:         ${totalSetsCount}`);
  console.log(`  New exercises:          ${newExCount}`);
  console.log(`  Skipped rows:           ${skipped.length}`);
  console.log('══════════════════════════════════════════════════');
  console.log('');

  if (DRY_RUN) {
    console.log('This was a DRY RUN. Nothing was written to the database.');
    console.log('To import, run with --import flag:');
    console.log('  npx ts-node --project scripts/tsconfig.json scripts/import-workouts.ts --import');
    console.log('');
    return;
  }

  // ── LIVE IMPORT ────────────────────────────────────────────────────────────

  console.log('Starting live import...');
  console.log('');

  let workoutsCreated = 0;
  let setsImported = 0;

  for (const workout of allWorkouts) {
    const validSets = workout.sets.filter(s => exerciseMap.has(s.exerciseRawName));
    if (validSets.length === 0) continue;

    const totalVolume = validSets.reduce((s, set) => s + set.weight_kg * set.reps, 0);
    const loggedAt = new Date(workout.date);
    loggedAt.setUTCHours(12, 0, 0, 0); // noon UTC to avoid timezone issues

    // Create workout row
    const { data: workoutRow, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        logged_at: loggedAt.toISOString(),
        total_volume_kg: Math.round(totalVolume * 100) / 100,
        notes: `Imported from ${workout.sourceFile}`,
      } as never)
      .select('id')
      .single();

    if (workoutError || !workoutRow) {
      console.error(`  ERROR creating workout for ${workout.date.toISOString().split('T')[0]}:`, workoutError?.message);
      continue;
    }

    const workoutId = (workoutRow as { id: string }).id;

    // Create workout_set rows
    const setRows = validSets.map(s => {
      const ex = exerciseMap.get(s.exerciseRawName)!;
      const estimated1rm = s.weight_kg * (1 + s.reps / 30);
      return {
        workout_id: workoutId,
        exercise_id: ex.id,
        weight_kg: s.weight_kg,
        reps: s.reps,
        set_number: s.setNumber,
        estimated_1rm_kg: Math.round(estimated1rm * 100) / 100,
      };
    });

    const { error: setsError } = await supabase
      .from('workout_sets')
      .insert(setRows as never);

    if (setsError) {
      console.error(`  ERROR inserting sets for workout ${workoutId}:`, setsError.message);
      continue;
    }

    workoutsCreated++;
    setsImported += setRows.length;
    console.log(`  ✓ ${workout.date.toISOString().split('T')[0]}  (${workout.sourceFile})  — ${setRows.length} sets, ${totalVolume.toFixed(1)}kg volume`);
  }

  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log('  IMPORT COMPLETE');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Workouts created:  ${workoutsCreated}`);
  console.log(`  Sets imported:     ${setsImported}`);
  console.log(`  New exercises:     ${newExCount}`);
  console.log('══════════════════════════════════════════════════');
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
