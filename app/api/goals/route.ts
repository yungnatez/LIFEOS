import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title: string;
    category: string;
    target_value: number;
    current_value?: number;
    start_value?: number;
    unit?: string;
    target_date: string;
    priority?: number;
    exercise_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: body.title,
      category: body.category as "physique" | "strength" | "finance" | "habit",
      target_value: body.target_value,
      current_value: body.current_value ?? 0,
      start_value: body.start_value ?? body.current_value ?? 0,
      unit: body.unit ?? null,
      target_date: body.target_date,
      priority: body.priority ?? 99,
      status: "active",
      progress_pct: 0,
      on_track: true,
      exercise_id: body.exercise_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
