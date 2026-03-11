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
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("display_order", { ascending: true });

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
    name: string;
    category: string;
    equipment: string;
    is_primary?: boolean;
    display_order?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.category || !body.equipment) {
    return Response.json(
      { error: "name, category, and equipment are required" },
      { status: 400 }
    );
  }

  // Check if user has 5+ primaries
  let warning: string | undefined;
  if (body.is_primary) {
    const { count } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .eq("active", true);
    if ((count ?? 0) >= 5) {
      warning =
        "You have 5+ primary lifts. Dashboard may be crowded.";
    }
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: body.name,
      category: body.category as "push" | "pull" | "legs" | "cardio" | "other",
      equipment: body.equipment as
        | "barbell"
        | "dumbbell"
        | "cable"
        | "machine"
        | "bodyweight"
        | "plate"
        | "other",
      is_primary: body.is_primary ?? false,
      display_order: body.display_order ?? 99,
      active: true,
    } as never)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json(
        { error: "An exercise with this name already exists" },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ...(data as object), warning });
}
