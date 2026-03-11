# LIFEOS — Life Operating System
## Master Build Document v2.0

Read this entire file before writing a single line of code.
This is the single source of truth. Follow it exactly.

---

## What This Is

A personal Life Operating System — a dark, military-ops style dashboard that
aggregates fitness, strength training, nutrition, habits, and financial data
into a single intelligent control centre.

The user (Nate) wants this to feel like mission control for his life.
Every feature must work perfectly. Every number must come from real data.
Every UI element must match the design spec below exactly.

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode — no `any`, no `ts-ignore`)
- TailwindCSS (no custom CSS files, no inline styles, Tailwind only)
- Recharts (all charts)
- Supabase (PostgreSQL + Auth)
- Vercel (hosting + cron jobs)
- Resend (email alerts)

---

## Design Reference Files — Read These Before Any UI Work

Before building any UI component, read all three files in `/design/`:

### `design/mockup-reference.jsx` — PRIMARY REFERENCE
A complete working React prototype of the full app. Extract from it:
- SVG ring animation logic (MissionRing component)
- Strategy Map SVG path + node rendering + hover logic
- Heatmap grid structure (ConsistencyTracker)
- All Recharts configurations (axes, colours, gradients, tooltips)
- Exact layout grid structure (grid-cols, gaps, padding values)
- Every Tailwind class combination used

Rebuild each component properly per the architecture in this document,
but the visual output must match this file exactly.

### `design/stitch-dashboard.html` — SPACING + TYPOGRAPHY REFERENCE
Original Stitch export for the main dashboard. Use for:
- Exact Tailwind spacing (p-5, gap-4, mb-2, etc.)
- Typography classes (text-xs, font-bold, tracking-widest, uppercase)
- Component nesting hierarchy and structure
- Background/border colour class combinations

### `design/stitch-analytics.html` — ANALYTICS LAYOUT REFERENCE
Original Stitch export for the Analytics screen. Use for:
- Tab layout and panel proportions
- "Core Model Variables" and "Savings Intelligence" panel structure
- Chart card layouts and annotation positioning

## Design System — Match This Exactly

### Colours (CSS variables in globals.css)
```css
:root {
  --bg:        #060B17;
  --card:      #0D1525;
  --border:    #1E2D45;
  --faint:     #1e293b;
  --primary:   #3b86f7;
  --physique:  #14b8a6;
  --strength:  #3b82f6;
  --finance:   #f59e0b;
  --habits:    #8b5cf6;
  --emerald:   #10b981;
  --red:       #ef4444;
  --text:      #f1f5f9;
  --muted:     #64748b;
}
```

### Typography
- Font: Space Grotesk (Google Fonts, weights 400/500/600/700)
- Section labels: 9px, uppercase, letter-spacing 0.2em, --muted colour
- Card titles: 13-14px, font-weight 700, white
- Body text: 12px, --text colour
- Large numbers: font-weight 900, white
- Monospace data (scores, values): font-weight 900

### Cards
```
background: var(--card)
border: 1px solid var(--border)
border-radius: 12px (rounded-xl)
padding: 20px (p-5)
position: relative
overflow: hidden
```

### Glow effect (on key cards)
```
box-shadow: 0 0 30px [colour]22
```

### Buttons
- Primary: bg-[--primary], white text, rounded-lg, px-4 py-2
- Ghost: transparent bg, border border-[--border], --muted text
- Danger: bg-red-500/10, border border-red-500/30, red text

### Progress bars
- Height: 5-8px
- Background: var(--faint)
- Fill: gradient or solid colour
- border-radius: full

### Badges
```
background: [colour]/15
border: 1px solid [colour]/40
border-radius: 6px
padding: 2px 8px
font-size: 9px
font-weight: 800
text-transform: uppercase
letter-spacing: 0.1em
```

### Labels (section headers)
```
font-size: 9px
font-weight: 800
letter-spacing: 0.2em
color: var(--muted)
text-transform: uppercase
margin-bottom: 8px
```

---

## UI Layout — Match The Mockup Exactly

### Navigation Bar (sticky top, backdrop-blur)
```
Left:  LIFEOS v2.4  [● SYSTEM ACTIVE]
Centre: [Dashboard] [Analytics] [Capital] [Config]
Right:  bell alerts | C COMMANDER avatar pill
```
- Active nav item: primary colour, primary/10 background, primary border-bottom
- Inactive: muted colour, transparent
- Alert bell: red dot indicator when unread alerts exist
- Clicking bell opens dropdown alert panel (last 5 alerts, mark as read)

### Main Dashboard (/dashboard) — Exact Layout

**Row 1 — 3 columns (280px | 1fr | 280px)**
- Col 1: Mission Score card (concentric SVG rings)
- Col 2: Commander Brief card
- Col 3: Priority Objective card (primary/10 bg, primary border)

**Row 2 — Full width**
- Strategy Visualization Map (curved SVG path + interactive milestone nodes)

**Row 3 — 3 equal columns**
- Col 1: Physique Analytics (bar chart + body fat/lean mass tiles + Log Weight button)
- Col 2: Strength Volume (dynamic primary lifts + SBD projected max + Log Workout button)
- Col 3: Financial Terminal (account balances + savings rate + Log Finance button)

**Row 4 — 2 columns (1fr | 2fr)**
- Col 1: Nutrition Adherence (macro tiles + calorie bar + Log Nutrition button)
- Col 2: Consistency Tracker (habit heatmap + streaks + Log Habits button)

### Analytics Page (/analytics) — Exact Layout

Header:
```
● SYSTEM STATUS: OPTIMAL  (badge, emerald)
Mission Control: Deep Analytics      [Export Intelligence Report btn]  [Re-Sync btn]
Real-time predictive modeling and cross-domain correlation engine
```

Tabs: [Weight Model] [Savings Forecast] [Performance Correlation] [Habit Matrix]

**Weight Model tab** — 2 columns (1fr | 320px)
- Left: Area chart full width. Title "Weight Prediction Model" + "On Track" badge.
  Subtitle: "Projected trend based on current 2,400 kcal/day avg"
  Forecast annotation bubble on chart at forecast point.
- Right: "CORE MODEL VARIABLES" panel with 4 variables + progress bars each

**Savings Forecast tab** — 2 columns (1fr | 320px)
- Left: Stacked bar chart (principal blue + compounding purple, 10 years)
  Legend: Principal / Compounding dots
  "2034 Target: £X Total" annotation on last bar
- Right: Savings Intelligence panel (4 metric tiles + AI Insight box)

**Performance Correlation tab** — 2 columns (1fr | 1fr)
- Left: Scatter plot (training volume vs strength gains)
  "CORRELATION: R² = 0.82" annotation below chart
- Right: Strength Progression multi-line chart (one line per primary lift)
  Legend below chart

**Habit Matrix tab** — Full width card
- Title "Habit Consistency Matrix" + "12-month cross-habit performance density"
- Legend: MISSED / PARTIAL / FULL with coloured squares
- 6 rows (one per habit), 90 columns (one per day), score % on right
- Strategic Insight callout at bottom (purple left border)

### Capital Page (/capital)
- 3 summary cards row (total savings, monthly inflow, net worth)
- Full width 10-year savings forecast chart
- Account list card with current balances

### Config Page (/config)
- Tabs: [Goals] [Exercises] [Alerts] [Profile]
- Each tab is a full card with its management UI

---

## Mission Score Ring — Exact SVG Spec

```
ViewBox: 0 0 160 160, centred at cx=80 cy=80
Transform: rotate(-90deg) so fill starts at top

4 concentric circles:
  Outer ring  r=44  stroke-width=7  colour: --physique  (#14b8a6)
  2nd ring    r=34  stroke-width=7  colour: --strength  (#3b82f6)
  3rd ring    r=24  stroke-width=7  colour: --finance   (#f59e0b)
  Inner ring  r=14  stroke-width=7  colour: --habits    (#8b5cf6)

Each ring has a background track: same r, stroke var(--faint), full circle

Fill calculation per ring:
  circumference = 2 * PI * r
  stroke-dasharray = circumference
  stroke-dashoffset = circumference * (1 - score/100)
  stroke-linecap = round

Transition on mount: stroke-dashoffset animates from circumference to final value
  CSS: transition: stroke-dashoffset 1.2s ease

Centre text (absolutely positioned overlay):
  Score integer: 38px, font-weight 900, white
  Trend: "+4% ▲" in emerald, 9px, font-weight 800, below score

Below ring: row of 4 items, each = coloured dot + 3-char label (PHY / STR / FIN / HAB)
```

---

## Strategy Map — Exact Spec

Full-width card with header "STRATEGY VISUALIZATION MAP" label +
subtitle "Timeline projection for Q3 – Q4 2024"
Two icon buttons top-right (zoom, options — decorative for now)

SVG fills the card width, height 160px:
```
Curved path: cubic bezier from left-10% to right-90%, dips and rises
Path styling:
  Future/dashed: stroke url(#pathGrad) strokeWidth=2.5 strokeDasharray="6 4"
  Completed/solid: stroke --primary strokeWidth=2.5 filter="url(#glow)"

Gradient (left to right):
  primaryColour 80% opacity → muted 20% opacity

Glow filter: feGaussianBlur stdDeviation=3

Nodes (up to 6, positioned proportionally by date along path):
  Completed: filled circle r=7, emerald bg, white ✓ text
  Active: filled circle r=10, primary bg, white inner dot r=3
          outer glow: box-shadow 0 0 16px primary/50
          pulse animation on outer ring
  Upcoming: outlined circle r=7, faint bg, muted border

Hover tooltip (absolute positioned, z-10):
  Dark card with coloured top border
  Status badge (COMPLETE / ACTIVE / UPCOMING)
  Title (12px bold white)
  Date + progress % (10px muted)

Label below each node:
  Title: 8px, bold, coloured by status
  Date: 7px, muted

Footer labels:
  Bottom-left: "AUG 01 / Project Start" (8px muted)
  Bottom-right: "DEC 2024 / Final Target" (8px muted, right-aligned)
```

---

## Database Schema — Complete

### users
```sql
CREATE TABLE users (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                         TEXT UNIQUE NOT NULL,
  name                          TEXT DEFAULT 'Commander',
  calorie_target                INTEGER DEFAULT 3000,
  protein_target_g              INTEGER DEFAULT 210,
  weight_goal_kg                DECIMAL(5,2),
  weight_direction              TEXT DEFAULT 'gain'
                                CHECK (weight_direction IN ('gain','lose','maintain')),
  savings_apy_pct               DECIMAL(4,2) DEFAULT 7.00,
  monthly_savings_target_pence  INTEGER DEFAULT 140000,
  created_at                    TIMESTAMPTZ DEFAULT NOW()
);
```

### exercises
```sql
CREATE TABLE exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL
                 CHECK (category IN ('push','pull','legs','cardio','other')),
  equipment      TEXT DEFAULT 'barbell'
                 CHECK (equipment IN (
                   'barbell','dumbbell','cable','machine',
                   'bodyweight','plate','other'
                 )),
  is_primary     BOOLEAN DEFAULT false,
  display_order  INTEGER DEFAULT 99,
  active         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

Seeded for every new user via trigger:
```
Bench Press          push    barbell    PRIMARY  order=1
Squat                legs    barbell    PRIMARY  order=2
Deadlift             pull    barbell    PRIMARY  order=3
Dumbbell Press       push    dumbbell   false    order=4
Lateral Raise        other   dumbbell   false    order=5
Lat Pulldown         pull    cable      false    order=6
Cable Bicep Curl     pull    cable      false    order=7
Tricep Pushdown (EZ Bar)          push  cable   false  order=8
Overhead Tricep Extension (EZ Bar) push cable   false  order=9
Rear Delt Cable Row  pull    cable      false    order=10
Plate Row            pull    plate      false    order=11
Overhead Press       push    barbell    false    order=12
```

### workouts
```sql
CREATE TABLE workouts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at        TIMESTAMPTZ DEFAULT NOW(),
  total_volume_kg  DECIMAL(10,2) DEFAULT 0,
  notes            TEXT
);
```

### workout_sets
```sql
CREATE TABLE workout_sets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id        UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id       UUID REFERENCES exercises(id),
  weight_kg         DECIMAL(6,2) NOT NULL,
  reps              INTEGER NOT NULL,
  set_number        INTEGER NOT NULL,
  estimated_1rm_kg  DECIMAL(6,2)
  -- Calculated on insert: weight_kg * (1 + reps/30)  [Epley formula]
);
```

### weight_logs
```sql
CREATE TABLE weight_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg     DECIMAL(5,2) NOT NULL,
  body_fat_pct  DECIMAL(4,2),
  lean_mass_kg  DECIMAL(5,2),
  -- lean_mass_kg = weight_kg * (1 - body_fat_pct/100), calculated on insert
  logged_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### nutrition_logs
```sql
CREATE TABLE nutrition_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date       DATE NOT NULL,
  calories       INTEGER NOT NULL,
  protein_g      DECIMAL(6,1),
  carbs_g        DECIMAL(6,1),
  fats_g         DECIMAL(6,1),
  adherence_pct  DECIMAL(5,2),
  -- adherence_pct = (calories / users.calorie_target) * 100
  UNIQUE(user_id, log_date)
);
```

### habits
```sql
CREATE TABLE habits (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_date         DATE NOT NULL,
  gym                BOOLEAN DEFAULT false,
  diet_adherent      BOOLEAN DEFAULT false,
  sleep_hours        DECIMAL(4,2),
  meditation         BOOLEAN DEFAULT false,
  deep_work_hours    DECIMAL(4,2),
  vitamin_intake     BOOLEAN DEFAULT false,
  completion_status  TEXT DEFAULT 'missed'
                     CHECK (completion_status IN ('full','partial','missed')),
  -- full:    all booleans true AND sleep>=7.5 AND deep_work>=4
  -- partial: some complete
  -- missed:  none complete
  UNIQUE(user_id, habit_date)
);
```

### finances
```sql
CREATE TABLE finances (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at               TIMESTAMPTZ DEFAULT NOW(),
  log_date                DATE NOT NULL DEFAULT CURRENT_DATE,
  turbo_fund_pence        INTEGER DEFAULT 0,
  safety_buffer_pence     INTEGER DEFAULT 0,
  investment_pence        INTEGER DEFAULT 0,
  monthly_income_pence    INTEGER,
  monthly_expenses_pence  INTEGER,
  savings_rate_pct        DECIMAL(5,2),
  -- savings_rate_pct = (income - expenses) / income * 100
  notes                   TEXT,
  actual_sync_id          TEXT,
  actual_synced_at        TIMESTAMPTZ,
  UNIQUE(user_id, log_date)
);
```

### goals
```sql
CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL
                 CHECK (category IN ('physique','strength','finance','habit')),
  target_value   DECIMAL(10,2) NOT NULL,
  current_value  DECIMAL(10,2) DEFAULT 0,
  start_value    DECIMAL(10,2),
  unit           TEXT,
  target_date    DATE NOT NULL,
  priority       INTEGER DEFAULT 99,
  status         TEXT DEFAULT 'active'
                 CHECK (status IN ('active','complete','paused')),
  progress_pct   DECIMAL(5,2) DEFAULT 0,
  on_track       BOOLEAN DEFAULT true,
  exercise_id    UUID REFERENCES exercises(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

Seed goals:
```
'Reach 90kg Bodyweight'  physique  target=90    start=84.5  unit='kg'  priority=1  target_date=2024-12-30
'Turbo Fund'             finance   target=3500  start=2850  unit='£'   priority=2  target_date=2024-10-30
'Safety Buffer'          finance   target=12000 start=12000 unit='£'   priority=3  target_date=2024-12-30
```

### alerts
```sql
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT CHECK (type IN ('warning','info','success','danger')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  read        BOOLEAN DEFAULT false,
  email_sent  BOOLEAN DEFAULT false
);
```

### system_state
```sql
CREATE TABLE system_state (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  mission_score    INTEGER DEFAULT 0,
  physique_score   DECIMAL(5,2) DEFAULT 0,
  strength_score   DECIMAL(5,2) DEFAULT 0,
  finance_score    DECIMAL(5,2) DEFAULT 0,
  habit_score      DECIMAL(5,2) DEFAULT 0,
  commander_brief  TEXT DEFAULT 'Awaiting data...',
  status           TEXT DEFAULT 'NOMINAL',
  efficiency_pct   DECIMAL(5,2) DEFAULT 0,
  last_updated     TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies — Apply to EVERY table
```sql
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON [table]
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Apply to: users, exercises, workouts, workout_sets (via workout),
weight_logs, nutrition_logs, habits, finances, goals, alerts, system_state

### Performance Indexes
```sql
CREATE INDEX idx_weight_logs_user_date     ON weight_logs(user_id, logged_at DESC);
CREATE INDEX idx_workouts_user_date        ON workouts(user_id, logged_at DESC);
CREATE INDEX idx_workout_sets_workout      ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise     ON workout_sets(exercise_id);
CREATE INDEX idx_nutrition_logs_user_date  ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX idx_habits_user_date          ON habits(user_id, habit_date DESC);
CREATE INDEX idx_finances_user_date        ON finances(user_id, log_date DESC);
CREATE INDEX idx_goals_user_status         ON goals(user_id, status);
CREATE INDEX idx_alerts_user_read          ON alerts(user_id, read, created_at DESC);
CREATE INDEX idx_exercises_user_primary    ON exercises(user_id, is_primary, display_order);
```

---

## New User Trigger — Seeds All Data

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID := NEW.id;
BEGIN
  -- Insert public user
  INSERT INTO public.users (id, email) VALUES (new_user_id, NEW.email);

  -- Seed exercises
  INSERT INTO exercises (user_id, name, category, equipment, is_primary, display_order) VALUES
    (new_user_id, 'Bench Press',                        'push',  'barbell',   true,  1),
    (new_user_id, 'Squat',                              'legs',  'barbell',   true,  2),
    (new_user_id, 'Deadlift',                           'pull',  'barbell',   true,  3),
    (new_user_id, 'Dumbbell Press',                     'push',  'dumbbell',  false, 4),
    (new_user_id, 'Lateral Raise',                      'other', 'dumbbell',  false, 5),
    (new_user_id, 'Lat Pulldown',                       'pull',  'cable',     false, 6),
    (new_user_id, 'Cable Bicep Curl',                   'pull',  'cable',     false, 7),
    (new_user_id, 'Tricep Pushdown (EZ Bar)',            'push',  'cable',     false, 8),
    (new_user_id, 'Overhead Tricep Extension (EZ Bar)', 'push',  'cable',     false, 9),
    (new_user_id, 'Rear Delt Cable Row',                'pull',  'cable',     false, 10),
    (new_user_id, 'Plate Row',                          'pull',  'plate',     false, 11),
    (new_user_id, 'Overhead Press',                     'push',  'barbell',   false, 12);

  -- Seed goals
  INSERT INTO goals (user_id, title, category, target_value, current_value, start_value, unit, target_date, priority) VALUES
    (new_user_id, 'Reach 90kg Bodyweight', 'physique', 90,    84.5, 84.5, 'kg', '2024-12-30', 1),
    (new_user_id, 'Turbo Fund',            'finance',  3500,  2850, 2850, '£',  '2024-10-30', 2),
    (new_user_id, 'Safety Buffer',         'finance',  12000, 12000, 12000, '£', '2024-12-30', 3);

  -- Seed blank system_state
  INSERT INTO system_state (user_id) VALUES (new_user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

## Exercise Management — Full Feature Spec

### Config → Exercises Tab Layout
```
EXERCISES                              [+ Add Exercise]

Filter: [All ▼] [All Equipment ▼]

Equipment  Name                        Category  Primary  Order   Actions
[icon]     Bench Press                 Push      [ON]     ↑↓ 1   [Edit] [Archive]
[icon]     Squat                       Legs      [ON]     ↑↓ 2   [Edit] [Archive]
[icon]     Deadlift                    Pull      [ON]     ↑↓ 3   [Edit] [Archive]
[icon]     Dumbbell Press              Push      [OFF]    ↑↓ 4   [Edit] [Archive]
...
```

### Add/Edit Exercise Modal
```
Exercise Name:   [______________]
Category:        [Push ▼]
Equipment:       [Cable ▼]
Mark as Primary: [toggle]  (shown on main dashboard strength card)

[Cancel]  [Save Exercise]
```

### Rules
- Toggle primary: instant update, Strength card reflects immediately
- Warning (not hard block) if user tries to set >5 primaries
- Archive hides from workout log dropdown but preserves all history
- Cannot delete exercises that have workout_sets (offer archive)
- Reorder with ↑↓ buttons updates display_order for all affected rows
- Duplicate name for same user is blocked at DB level (UNIQUE constraint)

---

## Workout Log Modal — Full Spec

```
WORKOUT LOGGER
──────────────────────────────────────────────

BENCH PRESS                          [× Remove]
  Set 1:  [115] kg  × [5] reps     → 1RM: 134kg
  Set 2:  [115] kg  × [4] reps     → 1RM: 130kg
  Set 3:  [110] kg  × [5] reps     → 1RM: 128kg
  [+ Add Set]

[+ Add Exercise ▼]  (dropdown grouped by category)

Notes: [optional________________________________]

TOTAL VOLUME: 1,600kg

[Cancel]  [Save Workout]
```

Behaviour:
- Dropdown groups exercises: PUSH / PULL / LEGS / OTHER
- Only shows active=true exercises
- Pre-fills weight from last logged set for that exercise
- 1RM updates live: weight * (1 + reps/30), shown in muted text
- Total volume updates live: sum(weight * reps) all sets
- Can add multiple exercises per workout session
- Save creates 1 workout row + N workout_set rows + calculates total_volume_kg

---

## Habit Log Modal — Full Spec

```
LOG TODAY'S HABITS  (date shown)
──────────────────────────────────

  Gym Session      [YES / NO toggle]
  Diet Adherent    [YES / NO toggle]
  Sleep            [_7.5_] hours
  Meditation       [YES / NO toggle]
  Deep Work        [_4.0_] hours
  Vitamins         [YES / NO toggle]

Completion: FULL / PARTIAL / MISSED  (shown live, updates as user toggles)

[Cancel]  [Save]
```

---

## Score Calculations — Exact Formulas

### physique_score (0-100)
```typescript
const startWeight   = weightLogs[weightLogs.length - 1]?.weight_kg ?? 0;
const targetWeight  = user.weight_goal_kg ?? 80;
const currentWeight = weightLogs[0]?.weight_kg ?? startWeight;
const totalChange   = Math.abs(targetWeight - startWeight);
const achieved      = Math.abs(currentWeight - startWeight);
return totalChange === 0 ? 0 : Math.min(100, Math.max(0, (achieved / totalChange) * 100));
```

### strength_score (0-100)
```typescript
// 4-week rolling avg volume vs first 4 weeks baseline
const recent4wk   = totalVolumeLastNDays(workouts, 28);
const baseline    = totalVolumeFirstNDays(workouts, 28);
if (baseline === 0) return 50;
return Math.min(100, Math.max(0, (recent4wk / baseline) * 100));
```

### finance_score (0-100)
```typescript
const financeGoals = goals.filter(g => g.category === 'finance' && g.status === 'active');
if (!financeGoals.length) return 0;
const avg = financeGoals.reduce((s, g) => s + g.progress_pct, 0) / financeGoals.length;
return Math.min(100, avg);
```

### habit_score (0-100)
```typescript
const last30 = habits.filter(h => isWithinLastNDays(h.habit_date, 30));
const fullDays = last30.filter(h => h.completion_status === 'full').length;
return Math.round((fullDays / 30) * 100);
```

### mission_score
```typescript
Math.round(physique * 0.40 + strength * 0.25 + finance * 0.25 + habits * 0.10)
```

---

## Goal Progress Updates (nightly)

```typescript
// For each active goal, update current_value + progress_pct:

if (goal.category === 'physique') {
  const latest = weightLogs[0];
  goal.current_value = latest?.weight_kg ?? goal.current_value;
  const range = Math.abs(goal.target_value - goal.start_value);
  const done  = Math.abs(goal.current_value - goal.start_value);
  goal.progress_pct = range === 0 ? 0 : Math.min(100, (done / range) * 100);
}

if (goal.category === 'finance') {
  const latest = finances[0];
  // Map goal title to field
  if (goal.title.toLowerCase().includes('turbo')) {
    goal.current_value = (latest?.turbo_fund_pence ?? 0) / 100;
  } else if (goal.title.toLowerCase().includes('safety')) {
    goal.current_value = (latest?.safety_buffer_pence ?? 0) / 100;
  }
  goal.progress_pct = Math.min(100, (goal.current_value / goal.target_value) * 100);
}

if (goal.category === 'strength' && goal.exercise_id) {
  const latest1rm = bestEstimated1rm(workoutSets, goal.exercise_id);
  goal.current_value = latest1rm;
  goal.progress_pct = Math.min(100, (latest1rm / goal.target_value) * 100);
}

// Mark complete
if (goal.progress_pct >= 100) goal.status = 'complete';
```

---

## Commander Brief Generator

```typescript
// /lib/calculations/commander-brief.ts
export function generateCommanderBrief(data: BriefInput): BriefOutput {

  // Weight trend
  const w = data.weightLogs;
  const weightDelta = w.length >= 2 ? w[0].weight_kg - w[1].weight_kg : 0;
  const weightTrend = weightDelta > 0.1 ? "upward"
    : weightDelta < -0.1 ? "downward" : "stable";

  // Strength trend (this week vs last week)
  const thisWeek = totalVolumeLastNDays(data.workouts, 7);
  const lastWeek = totalVolumeDaysNtoM(data.workouts, 7, 14);
  const strengthPct = lastWeek > 0
    ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
  const strengthDir = strengthPct >= 0
    ? `up ${strengthPct}%` : `down ${Math.abs(strengthPct)}%`;

  // Savings status
  const finance = data.finances[0];
  const savingsTarget = data.user.monthly_savings_target_pence;
  const monthlySurplus = finance
    ? (finance.monthly_income_pence ?? 0) - (finance.monthly_expenses_pence ?? 0) : 0;
  const savingsAhead = monthlySurplus >= savingsTarget;

  // Nearest goal
  const nearest = data.goals
    .filter(g => g.status === 'active')
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())[0];
  const daysLeft = nearest
    ? Math.ceil((new Date(nearest.target_date).getTime() - Date.now()) / 86400000) : null;

  const milestone = daysLeft !== null && daysLeft <= 30
    ? `${daysLeft} days to ${nearest.title}.`
    : "Your trajectory is optimal.";

  const brief = `Body mass trending ${weightTrend}. Strength volume ${strengthDir}. `
    + `Savings ${savingsAhead ? "ahead of" : "behind"} schedule. ${milestone}`;

  const allGood = data.habitScore >= 80 && savingsAhead && strengthPct >= 0;
  const status = allGood ? "NOMINAL" : "MONITOR";
  const efficiency = Math.round((data.habitScore + (savingsAhead ? 100 : 65) + Math.max(0, 80 + strengthPct)) / 3);

  return { brief, status, efficiency };
}
```

---

## API Routes — Complete Spec

### GET /api/dashboard
Returns everything needed for main dashboard in one call:
```typescript
{
  systemState:     SystemState,
  priorityGoal:    Goal & { daysRemaining: number, onTrack: boolean },
  recentWeights:   WeightLog[],           // last 12, for chart
  latestWeight:    WeightLog | null,
  primaryLifts:    LiftSummary[],         // is_primary lifts + latest set data
  totalVolumeWeek: number,                // this week kg
  latestNutrition: NutritionLog | null,
  habitHeatmap:    HabitDay[],            // last 48 days
  streaks:         { gym: number, sleep: number, meditation: number },
  finances:        FinanceSummary | null,
  financialGoals:  Goal[],
  allGoals:        Goal[],                // for strategy map
  unreadAlerts:    Alert[],
}
```

### POST /api/log/weight
```typescript
// Body: { weight_kg: number, body_fat_pct?: number }
lean_mass_kg = body_fat_pct ? weight_kg * (1 - body_fat_pct / 100) : null
INSERT weight_logs
// Immediately recalculate + update physique_score in system_state
RETURN inserted row
```

### POST /api/log/workout
```typescript
// Body: { sets: Array<{ exercise_id, weight_kg, reps, set_number }>, notes? }
estimated_1rm = weight_kg * (1 + reps / 30)  // for each set
total_volume = SUM(weight_kg * reps)          // all sets
INSERT workouts (total_volume_kg, notes)
INSERT workout_sets (all sets with estimated_1rm)
RETURN workout + sets + exercise names
```

### POST /api/log/nutrition
```typescript
// Body: { calories, protein_g, carbs_g, fats_g }
// Get user.calorie_target
adherence_pct = (calories / calorie_target) * 100
UPSERT nutrition_logs ON CONFLICT (user_id, log_date) DO UPDATE
RETURN upserted row
```

### POST /api/log/habit
```typescript
// Body: { gym?, diet_adherent?, sleep_hours?, meditation?, deep_work_hours?, vitamin_intake? }
// Calculate completion_status:
tracked = [gym, diet_adherent, sleep_hours >= 7.5, meditation, deep_work_hours >= 4, vitamin_intake]
completed = tracked.filter(Boolean).length
status = completed === 6 ? 'full' : completed > 0 ? 'partial' : 'missed'
UPSERT habits ON CONFLICT (user_id, habit_date) DO UPDATE
RETURN upserted row
```

### POST /api/log/finance
```typescript
// Body: { turbo_fund_pence?, safety_buffer_pence?, investment_pence?, monthly_income_pence?, monthly_expenses_pence? }
savings_rate_pct = income > 0 ? ((income - expenses) / income * 100) : null
UPSERT finances ON CONFLICT (user_id, log_date) DO UPDATE
RETURN upserted row
```

### GET /api/exercises
```typescript
SELECT * FROM exercises
WHERE user_id = userId AND active = true
ORDER BY display_order ASC
```

### POST /api/exercises
Create new exercise. Validate no duplicate name.

### PATCH /api/exercises/[id]
Update name, category, equipment, is_primary, display_order, active.
When setting is_primary=true and user already has 5+ primaries:
return 200 with `{ warning: "You have 5+ primary lifts. Dashboard may be crowded." }`

### GET /api/actual/sync
STUB: returns `{ status: "manual_mode", actual_enabled: false }`

### POST /api/cron/nightly
Requires `Authorization: Bearer CRON_SECRET`.
See Cron Job section below.

---

## Nightly Cron Job

Schedule: `"5 0 * * *"` in vercel.json

```typescript
// /app/api/cron/nightly/route.ts
export async function POST(req: Request) {
  // 1. Verify CRON_SECRET
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get all users
  const { data: users } = await supabase.from('users').select('id');

  // 3. For each user, run full recalculation
  for (const user of users) {
    // Fetch all data in parallel
    const [weightLogs, workouts, habits, finances, goals, exercises] = await Promise.all([
      getWeightLogs(user.id, 60),
      getWorkoutsWithSets(user.id, 60),
      getHabits(user.id, 30),
      getFinances(user.id, 5),
      getGoals(user.id),
      getExercises(user.id),
    ]);

    // Calculate scores
    const physique_score  = calcPhysiqueScore(weightLogs, user);
    const strength_score  = calcStrengthScore(workouts);
    const finance_score   = calcFinanceScore(goals);
    const habit_score     = calcHabitScore(habits);
    const mission_score   = Math.round(
      physique_score * 0.4 + strength_score * 0.25 +
      finance_score * 0.25 + habit_score * 0.1
    );

    // Update goal progress
    for (const goal of goals) {
      await updateGoalProgress(goal, { weightLogs, finances, workouts });
    }

    // Generate brief
    const { brief, status, efficiency } = generateCommanderBrief({
      weightLogs, workouts, finances, goals, habitScore: habit_score, user
    });

    // Upsert system_state
    await supabase.from('system_state').upsert({
      user_id: user.id,
      mission_score, physique_score, strength_score,
      finance_score, habit_score,
      commander_brief: brief, status,
      efficiency_pct: efficiency,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Run alert checks
    await checkAndCreateAlerts(user.id, {
      weightLogs, workouts, habits, finances, goals, habit_score
    });
  }

  return Response.json({ ok: true, processed: users.length });
}
```

### Alert Logic
```typescript
async function checkAndCreateAlerts(userId, data) {

  // 1. MUSCLE LOSS RISK
  if (data.weightLogs.length >= 2) {
    const [latest, previous] = data.weightLogs;
    const lossKg = previous.weight_kg - latest.weight_kg;
    const lossPct = (lossKg / previous.weight_kg) * 100;
    const thisWeekVol = totalVolumeLastNDays(data.workouts, 7);
    const lastWeekVol = totalVolumeDaysNtoM(data.workouts, 7, 14);
    if (lossPct > 1.0 && thisWeekVol < lastWeekVol) {
      await maybeInsertAlert(userId, 'danger', 'Muscle Loss Risk',
        `Weight loss ${lossPct.toFixed(1)}% this week with declining training volume. ` +
        `Increase protein and reduce caloric deficit.`);
    }
  }

  // 2. SAVINGS WARNING
  if (data.finances.length >= 2) {
    const [f1, f2] = data.finances;
    const targetRate = 62; // could come from user settings
    if (f1.savings_rate_pct < targetRate && f2.savings_rate_pct < targetRate) {
      await maybeInsertAlert(userId, 'warning', 'Savings Rate Falling',
        `Savings rate below target for 2 consecutive entries. Review your expenses.`);
    }
  }

  // 3. HABIT CONSISTENCY
  const last7 = data.habits.filter(h => isWithinLastNDays(h.habit_date, 7));
  const weekScore = last7.filter(h => h.completion_status === 'full').length / 7 * 100;
  if (weekScore < 70) {
    await maybeInsertAlert(userId, 'warning', 'Consistency Dropping',
      `Habit completion at ${Math.round(weekScore)}% this week. Refocus on core habits.`);
  }

  // 4. MILESTONE APPROACHING
  for (const goal of data.goals.filter(g => g.status === 'active')) {
    const days = Math.ceil((new Date(goal.target_date) - Date.now()) / 86400000);
    if (days <= 14 && days >= 0) {
      await maybeInsertAlert(userId, 'info', `Milestone Approaching`,
        `${goal.title}: ${days} days remaining. Progress: ${goal.progress_pct.toFixed(0)}%.`);
    }
  }

  // 5. GOAL COMPLETE
  for (const goal of data.goals.filter(g => g.status === 'complete')) {
    await maybeInsertAlert(userId, 'success', `Goal Achieved: ${goal.title}`,
      `Congratulations. Update your targets to maintain momentum.`);
  }
}

// maybeInsertAlert: checks if similar unread alert already exists before inserting
async function maybeInsertAlert(userId, type, title, message) {
  const { data: existing } = await supabase.from('alerts')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .eq('read', false)
    .gte('created_at', subDays(new Date(), 3).toISOString())
    .limit(1);
  if (!existing?.length) {
    await supabase.from('alerts').insert({ user_id: userId, type, title, message });
  }
}
```

---

## Forecasting Functions

### Weight Forecast
```typescript
// /lib/calculations/forecasts.ts
export function calcWeightForecast(logs: WeightLog[]): WeightDataPoint[] {
  if (logs.length < 2) return [];
  // Sort ascending by date
  const sorted = [...logs].sort((a, b) =>
    new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

  // Linear regression (least squares)
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map(l => l.weight_kg);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate future points (3 months)
  const lastDate = new Date(sorted[sorted.length - 1].logged_at);
  const forecast: WeightDataPoint[] = [];
  for (let i = 1; i <= 12; i++) {
    const date = addWeeks(lastDate, i);
    const weight = intercept + slope * (n - 1 + i);
    forecast.push({ date: date.toISOString(), weight_kg: weight, forecast: true });
  }
  return [...sorted.map(l => ({ ...l, forecast: false })), ...forecast];
}
```

### Savings Forecast
```typescript
export function calcSavingsForecast(
  monthlySavingsPence: number,
  currentBalancePence: number,
  apyPct: number,
  years = 10
): SavingsDataPoint[] {
  const monthly = monthlySavingsPence / 100;
  const current = currentBalancePence / 100;
  const apy = apyPct / 100;
  return Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const principal = current + (monthly * 12 * y);
    const compound = principal * (Math.pow(1 + apy, y) - 1);
    return {
      year: String(new Date().getFullYear() + y),
      principal: Math.round(principal),
      compound: Math.round(compound),
    };
  });
}
```

---

## Component File Structure

```
/app
  globals.css                      ← CSS variables from design system + Space Grotesk import
  layout.tsx                       ← Root layout, dark background, font
  page.tsx                         ← redirect('/dashboard')
  /dashboard
    page.tsx                       ← Server component, calls /api/dashboard
    loading.tsx                    ← Skeleton matching dashboard layout exactly
  /analytics
    page.tsx                       ← Server component
    loading.tsx
  /capital
    page.tsx
  /config
    page.tsx                       ← "use client" (interactive tabs/forms)
  /login
    page.tsx
  /api
    /dashboard/route.ts
    /analytics/weight/route.ts
    /analytics/strength/route.ts
    /analytics/savings/route.ts
    /analytics/habits/route.ts
    /goals/route.ts
    /exercises/route.ts
    /exercises/[id]/route.ts
    /alerts/route.ts
    /alerts/[id]/read/route.ts
    /log/weight/route.ts
    /log/workout/route.ts
    /log/nutrition/route.ts
    /log/habit/route.ts
    /log/finance/route.ts
    /actual/sync/route.ts
    /cron/nightly/route.ts

/components
  /dashboard
    MissionRing.tsx                ← "use client" — animated SVG rings
    CommanderBrief.tsx
    PriorityObjective.tsx
    StrategyMap.tsx                ← "use client" — SVG + hover states
    PhysiqueCard.tsx               ← "use client" — Recharts BarChart
    StrengthCard.tsx               ← "use client" — dynamic lifts
    FinancialTerminal.tsx
    NutritionCard.tsx
    ConsistencyTracker.tsx         ← "use client" — heatmap
  /analytics
    WeightChart.tsx                ← "use client"
    StrengthChart.tsx              ← "use client"
    SavingsChart.tsx               ← "use client"
    CorrelationChart.tsx           ← "use client"
    HabitMatrixFull.tsx            ← "use client"
    ModelVariables.tsx
    SavingsIntelligence.tsx
  /modals
    LogWeightModal.tsx             ← "use client"
    LogWorkoutModal.tsx            ← "use client" — dynamic exercise select
    LogNutritionModal.tsx          ← "use client"
    LogHabitModal.tsx              ← "use client"
    LogFinanceModal.tsx            ← "use client"
  /config
    ExerciseManager.tsx            ← "use client" — full CRUD + reorder
    GoalManager.tsx                ← "use client" — full CRUD + priority
    AlertSettings.tsx              ← "use client"
    ProfileSettings.tsx            ← "use client"
  /shared
    Card.tsx
    Badge.tsx
    ProgressBar.tsx
    Label.tsx
    Nav.tsx                        ← "use client" — alert dropdown
    Footer.tsx
    AlertDropdown.tsx              ← "use client"
    LoadingSkeleton.tsx
    EmptyState.tsx

/lib
  /supabase
    client.ts
    server.ts
    middleware.ts
    types.ts                       ← Manual TypeScript types matching schema
  /calculations
    mission-score.ts
    forecasts.ts
    commander-brief.ts
    alerts.ts
    habit-completion.ts
  /finance
    index.ts                       ← Abstraction layer for financial data
  /utils
    format.ts                      ← formatPence, formatKg, formatDate, formatPct

/middleware.ts                     ← Supabase auth protection
```

---

## Utility Functions

```typescript
// /lib/utils/format.ts
export const formatPence   = (p: number) => `£${(p / 100).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`;
export const formatKg      = (kg: number) => `${kg.toFixed(1)}kg`;
export const formatPct     = (n: number) => `${Math.round(n)}%`;
export const formatDate    = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const formatVolume  = (kg: number) => `${kg.toLocaleString()}kg`;
```

---

## Auth Flow

```typescript
// middleware.ts — protects all routes except /login and /api/cron
export async function middleware(request: NextRequest) {
  // Public: /login, /_next, /api/cron (checked by CRON_SECRET internally)
  // All others: require valid Supabase session
  // If no session: redirect to /login
  // If session on /login: redirect to /dashboard
}
```

Login page:
- Email + password form (no magic link for simplicity)
- Supabase Auth `signInWithPassword`
- On success: redirect to /dashboard
- On first signup: trigger runs, seeds data, redirect to /dashboard

---

## Finance Abstraction Layer

```typescript
// /lib/finance/index.ts
// All financial UI reads through this layer.
// When Actual Budget is enabled, only this file changes.

export async function getLatestBalances(userId: string) {
  if (process.env.ACTUAL_ENABLED === 'true') {
    // TODO: implement Actual Budget fetch
    throw new Error('Actual Budget not implemented yet');
  }
  // Default: read from Supabase finances table
  const { data } = await supabaseServer()
    .from('finances')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getMonthlyFlow(userId: string, months = 12) { ... }
export async function getSavingsRate(userId: string) { ... }
```

Config page → Integrations section shows:
```
Actual Budget     [Not Connected]     Manual entry active
                  [Learn how to connect →]
```

---

## Empty States (required for every chart and card)

```typescript
// /components/shared/EmptyState.tsx
// Props: icon (emoji), title, message, action (optional button)
// Used when: no weight logs, no workouts, no nutrition, etc.

// Example:
<EmptyState
  icon="⚖️"
  title="No weight entries yet"
  message="Log your first weigh-in to start tracking"
  action={{ label: "+ Log Weight", onClick: () => setModal('weight') }}
/>
```

Every chart component must check if data is empty and render EmptyState.
Do NOT render empty Recharts containers with no data — they look broken.

---

## Loading Skeletons

```typescript
// Every page has a loading.tsx that renders a skeleton matching the exact layout
// Use Tailwind: bg-[--faint] animate-pulse rounded-xl
// Match heights/widths of real components exactly
// Use Suspense boundaries per data section where possible
```

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CRON_SECRET=lifeos-nightly-secret-change-this
ACTUAL_ENABLED=false
ACTUAL_SERVER_URL=
ACTUAL_SERVER_PASSWORD=
ACTUAL_BUDGET_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/nightly",
      "schedule": "5 0 * * *"
    }
  ]
}
```

---

## Non-Negotiable Conventions

1. TypeScript strict — no `any`, no `ts-ignore`, explicit types everywhere
2. Server components default — `"use client"` only when required
3. No direct Supabase calls from client components — API routes only
4. All DB queries filter by `user_id` — RLS is backup, not primary
5. Monetary values: INTEGER pence in DB, formatPence() for display
6. Weight values: DECIMAL(5,2) kg in DB, formatKg() for display
7. Dates: ISO UTC in DB, formatDate() for display
8. nutrition_logs + habits: one row per day — always upsert
9. No hardcoded exercise names in any component — always dynamic from DB
10. All API routes: return `{ error: string }` on failure with status code
11. All charts: handle empty data with EmptyState component
12. All data sections: loading skeleton while fetching
13. Supabase queries: always `.eq('user_id', userId)` — never fetch all users' data
14. String formatting: always use utility functions, never inline

---

## Build Order — Follow Exactly

### Session 1 — Foundation
1. `npx create-next-app lifeos --typescript --tailwind --app --eslint`
2. Install: `@supabase/ssr @supabase/supabase-js recharts resend date-fns`
3. Create full folder structure
4. Create `globals.css` with all CSS variables + Space Grotesk import
5. Create `vercel.json`
6. Create `/lib/supabase/client.ts` + `server.ts` + `types.ts`
7. Create `/lib/utils/format.ts`
8. Create `supabase/migrations/001_schema.sql` (all tables)
9. Create `supabase/migrations/002_rls.sql` (all RLS policies)
10. Create `supabase/migrations/003_indexes.sql`
11. Create `supabase/migrations/004_triggers.sql` (new user trigger + seeds)
12. Create `.env.local` placeholder
13. Confirm: `npm run dev` runs without errors, / redirects to /dashboard

### Session 2 — Full Dashboard UI
1. Shared components: Card, Badge, ProgressBar, Label, EmptyState, LoadingSkeleton
2. Nav component with alert dropdown
3. Footer component
4. MissionRing (animated SVG, accepts 4 score props)
5. CommanderBrief (accepts brief text, status, efficiency)
6. PriorityObjective (accepts goal, daysRemaining, onTrack)
7. StrategyMap (accepts goals array, renders SVG path + nodes)
8. PhysiqueCard (accepts weightLogs, renders BarChart + tiles)
9. StrengthCard (accepts primaryLifts array — fully dynamic)
10. FinancialTerminal (accepts balances, goals)
11. NutritionCard (accepts nutritionLog, userTargets)
12. ConsistencyTracker (accepts habitDays array, streaks)
13. All 5 log modals
14. Dashboard page with MOCK DATA — every component renders
15. Check: dashboard matches mockup exactly, pixel-perfect

### Session 3 — Analytics Page
1. WeightChart (AreaChart + forecast line + annotation bubble)
2. StrengthChart (LineChart, dynamic lines per primary lift)
3. SavingsChart (BarChart stacked principal + compound)
4. CorrelationChart (ScatterChart + R² annotation)
5. HabitMatrixFull (90-day, 6 rows, dynamic from habits data)
6. ModelVariables panel
7. SavingsIntelligence panel
8. Analytics page with 4 tabs, all components, mock data
9. Check: analytics matches mockup exactly

### Session 4 — Backend + Real Data
1. All calculation functions in /lib/calculations/
2. Finance abstraction layer
3. All API routes
4. Nightly cron job
5. Alert logic + Resend email sending
6. Wire dashboard page to /api/dashboard
7. Wire analytics to real endpoints
8. Wire all log modals to POST routes
9. Test: log weight → appears on dashboard chart
10. Test: log workout → appears on strength card
11. Test: log nutrition → updates nutrition card
12. Test: log habit → updates heatmap
13. Test: log finance → updates financial terminal

### Session 5 — Auth + Config + Deploy
1. Login page + Supabase Auth
2. Middleware protecting all routes
3. Config page — Goals tab (GoalManager)
4. Config page — Exercises tab (ExerciseManager — full CRUD + reorder)
5. Config page — Alerts tab
6. Config page — Profile tab
7. Capital page
8. Test exercise management end to end:
   - Add new exercise → appears in workout modal
   - Toggle primary → appears/disappears from strength card
   - Archive exercise → gone from dropdown, history preserved
9. Add skeleton loaders to all sections
10. Test all empty states render correctly
11. Run SQL migrations in Supabase dashboard
12. Deploy to Vercel: `vercel --prod`
13. Set all env vars in Vercel dashboard
14. Confirm cron job registered in Vercel
15. Final end-to-end test in production

---

## Do NOT Build Yet
- Actual Budget integration (stub + abstraction layer only)
- AI text generation (template-based only)
- CSV import
- Mobile app
- Multi-user features
- Dark/light mode toggle (dark only)
- Social features
