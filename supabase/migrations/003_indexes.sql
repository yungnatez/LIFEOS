-- LIFEOS Performance Indexes
-- Migration 003: All indexes for query performance

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
