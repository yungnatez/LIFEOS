-- ============================================================
-- Migration 005: Extended nutrition columns + weight log_date
-- ============================================================

-- ─── weight_logs ─────────────────────────────────────────────
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS log_date DATE;
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS bmi NUMERIC(5,2);

-- Backfill log_date from logged_at (UTC date)
UPDATE weight_logs
SET log_date = (logged_at AT TIME ZONE 'UTC')::date
WHERE log_date IS NULL;

-- Deduplicate: keep the most recent entry per (user_id, log_date)
DELETE FROM weight_logs
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, log_date
             ORDER BY logged_at DESC
           ) AS rn
    FROM weight_logs
    WHERE log_date IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Add UNIQUE constraint for upsert (idempotent)
DO $$ BEGIN
  ALTER TABLE weight_logs
    ADD CONSTRAINT weight_logs_user_log_date_unique UNIQUE (user_id, log_date);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- ─── habits: steps column (was added via code, ensure it exists) ──
ALTER TABLE habits ADD COLUMN IF NOT EXISTS steps INTEGER DEFAULT 0;

-- ─── nutrition_logs: extended columns ────────────────────────
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS calories_kcal    NUMERIC(8,1);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS fat_g            NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS fiber_g          NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS sugar_g          NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS saturated_fat_g  NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS monounsaturated_fat_g NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS polyunsaturated_fat_g NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS cholesterol_mg   NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS sodium_mg        NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS water_ml         NUMERIC(10,1);
-- Minerals
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS calcium_mg       NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS iron_mg          NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS magnesium_mg     NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS phosphorus_mg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS potassium_mg     NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS zinc_mg          NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS copper_mg        NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS manganese_mg     NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS selenium_mcg     NUMERIC(8,3);
-- Vitamins
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_a_mcg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_c_mg     NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_d_mcg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_e_mg     NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_k_mcg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_b6_mg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS vitamin_b12_mcg  NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS niacin_mg        NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS riboflavin_mg    NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS thiamin_mg       NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS folate_mcg       NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS pantothenic_acid_mg NUMERIC(8,3);
-- Activity (per-day totals alongside nutrition)
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS steps            INTEGER;
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS distance_km      NUMERIC(8,3);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS flights_climbed  INTEGER;
