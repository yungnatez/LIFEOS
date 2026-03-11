-- LIFEOS Database Schema
-- Migration 001: All tables

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

CREATE TABLE workouts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at        TIMESTAMPTZ DEFAULT NOW(),
  total_volume_kg  DECIMAL(10,2) DEFAULT 0,
  notes            TEXT
);

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

CREATE TABLE weight_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg     DECIMAL(5,2) NOT NULL,
  body_fat_pct  DECIMAL(4,2),
  lean_mass_kg  DECIMAL(5,2),
  -- lean_mass_kg = weight_kg * (1 - body_fat_pct/100), calculated on insert
  logged_at     TIMESTAMPTZ DEFAULT NOW()
);

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
