import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("exercises")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Warn if setting is_primary and already have 5+
  let warning: string | undefined;
  if (body.is_primary === true) {
    const { count } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .eq("active", true)
      .neq("id", params.id);
    if ((count ?? 0) >= 5) {
      warning = "You have 5+ primary lifts. Dashboard may be crowded.";
    }
  }

  // If archiving, check for workout_sets
  if (body.active === false) {
    const { count } = await supabase
      .from("workout_sets")
      .select("*", { count: "exact", head: true })
      .eq("exercise_id", params.id);
    if ((count ?? 0) > 0) {
      // Archive instead of delete — allowed
    }
  }

  const { data, error } = await supabase
    .from("exercises")
    .update(body as never)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ...(data as object), warning });
}
