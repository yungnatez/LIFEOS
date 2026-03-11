-- LIFEOS RLS Policies
-- Migration 002: Row Level Security on all tables

ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_state ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "own_data" ON users
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- exercises
CREATE POLICY "own_data" ON exercises
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workouts
CREATE POLICY "own_data" ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workout_sets: access via parent workout ownership
CREATE POLICY "own_data" ON workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

-- weight_logs
CREATE POLICY "own_data" ON weight_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- nutrition_logs
CREATE POLICY "own_data" ON nutrition_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- habits
CREATE POLICY "own_data" ON habits
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- finances
CREATE POLICY "own_data" ON finances
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- goals
CREATE POLICY "own_data" ON goals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- alerts
CREATE POLICY "own_data" ON alerts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- system_state
CREATE POLICY "own_data" ON system_state
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
