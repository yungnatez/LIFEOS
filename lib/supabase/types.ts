export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          calorie_target: number;
          protein_target_g: number;
          weight_goal_kg: number | null;
          weight_direction: "gain" | "lose" | "maintain";
          savings_apy_pct: number;
          monthly_savings_target_pence: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: "push" | "pull" | "legs" | "cardio" | "other";
          equipment:
            | "barbell"
            | "dumbbell"
            | "cable"
            | "machine"
            | "bodyweight"
            | "plate"
            | "other";
          is_primary: boolean;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["exercises"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["exercises"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          total_volume_kg: number;
          notes: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workouts"]["Row"],
          "id" | "logged_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["workouts"]["Row"],
              "id" | "logged_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["workouts"]["Row"]>;
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          weight_kg: number;
          reps: number;
          set_number: number;
          estimated_1rm_kg: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_sets"]["Row"], "id"> &
          Partial<Pick<Database["public"]["Tables"]["workout_sets"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["workout_sets"]["Row"]>;
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          body_fat_pct: number | null;
          lean_mass_kg: number | null;
          logged_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["weight_logs"]["Row"],
          "id" | "logged_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["weight_logs"]["Row"],
              "id" | "logged_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Row"]>;
      };
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          calories: number;
          protein_g: number | null;
          carbs_g: number | null;
          fats_g: number | null;
          adherence_pct: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["nutrition_logs"]["Row"], "id"> &
          Partial<Pick<Database["public"]["Tables"]["nutrition_logs"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["nutrition_logs"]["Row"]>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          habit_date: string;
          gym: boolean;
          diet_adherent: boolean;
          sleep_hours: number | null;
          meditation: boolean;
          deep_work_hours: number | null;
          vitamin_intake: boolean;
          completion_status: "full" | "partial" | "missed";
        };
        Insert: Omit<Database["public"]["Tables"]["habits"]["Row"], "id"> &
          Partial<Pick<Database["public"]["Tables"]["habits"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["habits"]["Row"]>;
      };
      finances: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          log_date: string;
          turbo_fund_pence: number;
          safety_buffer_pence: number;
          investment_pence: number;
          monthly_income_pence: number | null;
          monthly_expenses_pence: number | null;
          savings_rate_pct: number | null;
          notes: string | null;
          actual_sync_id: string | null;
          actual_synced_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["finances"]["Row"],
          "id" | "logged_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["finances"]["Row"],
              "id" | "logged_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["finances"]["Row"]>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: "physique" | "strength" | "finance" | "habit";
          target_value: number;
          current_value: number;
          start_value: number | null;
          unit: string | null;
          target_date: string;
          priority: number;
          status: "active" | "complete" | "paused";
          progress_pct: number;
          on_track: boolean;
          exercise_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["goals"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["goals"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          type: "warning" | "info" | "success" | "danger";
          title: string;
          message: string;
          created_at: string;
          read: boolean;
          email_sent: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["alerts"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["alerts"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Row"]>;
      };
      system_state: {
        Row: {
          id: string;
          user_id: string;
          mission_score: number;
          physique_score: number;
          strength_score: number;
          finance_score: number;
          habit_score: number;
          commander_brief: string;
          status: string;
          efficiency_pct: number;
          last_updated: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["system_state"]["Row"],
          "id"
        > &
          Partial<Pick<Database["public"]["Tables"]["system_state"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["system_state"]["Row"]>;
      };
    };
  };
};

// Convenience row types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type Workout = Database["public"]["Tables"]["workouts"]["Row"];
export type WorkoutSet = Database["public"]["Tables"]["workout_sets"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
export type NutritionLog = Database["public"]["Tables"]["nutrition_logs"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type Finance = Database["public"]["Tables"]["finances"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type SystemState = Database["public"]["Tables"]["system_state"]["Row"];

// Composite types used by API responses
export type LiftSummary = {
  exercise_id: string;
  name: string;
  best_set: string;        // e.g. "115 × 5"
  estimated_1rm_kg: number;
  progress_pct: number;    // vs 4-week baseline
};

export type HabitDay = {
  date: string;
  completion_status: "full" | "partial" | "missed";
};

export type FinanceSummary = {
  turbo_fund_pence: number;
  safety_buffer_pence: number;
  investment_pence: number;
  savings_rate_pct: number | null;
  monthly_income_pence: number | null;
  monthly_expenses_pence: number | null;
};

export type WeightDataPoint = {
  date: string;
  weight_kg: number;
  forecast: boolean;
};

export type SavingsDataPoint = {
  year: string;
  principal: number;
  compound: number;
};

export type BriefInput = {
  weightLogs: WeightLog[];
  workouts: (Workout & { sets: WorkoutSet[] })[];
  finances: Finance[];
  goals: Goal[];
  habitScore: number;
  user: User;
};

export type BriefOutput = {
  brief: string;
  status: string;
  efficiency: number;
};
