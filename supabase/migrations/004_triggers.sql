-- LIFEOS Triggers
-- Migration 004: New user trigger + seed data

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID := NEW.id;
BEGIN
  -- Insert public user profile
  INSERT INTO public.users (id, email)
  VALUES (new_user_id, NEW.email);

  -- Seed default exercises (primary = the 5 lifts tracked on the dashboard)
  INSERT INTO exercises (user_id, name, category, equipment, is_primary, display_order) VALUES
    (new_user_id, 'Bench Press',                         'push',  'barbell',   false, 1),
    (new_user_id, 'Squat',                               'legs',  'barbell',   false, 2),
    (new_user_id, 'Deadlift',                            'pull',  'barbell',   false, 3),
    (new_user_id, 'Dumbbell Press',                      'push',  'dumbbell',  true,  4),
    (new_user_id, 'Lateral Raise',                       'other', 'dumbbell',  false, 5),
    (new_user_id, 'Lat Pulldown',                        'pull',  'cable',     true,  6),
    (new_user_id, 'Cable Bicep Curl',                    'pull',  'cable',     true,  7),
    (new_user_id, 'Tricep Pushdown (EZ Bar)',             'push',  'cable',     true,  8),
    (new_user_id, 'Overhead Tricep Extension (EZ Bar)',  'push',  'cable',     false, 9),
    (new_user_id, 'Rear Delt Cable Row',                 'pull',  'cable',     true,  10),
    (new_user_id, 'Plate Row',                           'pull',  'plate',     false, 11),
    (new_user_id, 'Overhead Press',                      'push',  'barbell',   false, 12);

  -- Seed starter goals
  INSERT INTO goals (user_id, title, category, target_value, current_value, start_value, unit, target_date, priority) VALUES
    (new_user_id, 'Reach 90kg Bodyweight', 'physique', 90,    84.5,  84.5,  'kg', '2026-12-31', 1),
    (new_user_id, 'Turbo Fund',            'finance',  3500,  2850,  2850,  '£',  '2026-06-30', 2),
    (new_user_id, 'Safety Buffer',         'finance',  12000, 12000, 12000, '£',  '2026-12-31', 3);

  -- Seed blank system_state row
  INSERT INTO system_state (user_id) VALUES (new_user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
