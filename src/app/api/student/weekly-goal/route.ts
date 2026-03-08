import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";
import { startOfWeek, format } from "date-fns";

function getCurrentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile || profile.role !== "student")
    return NextResponse.json({ error: "Student only" }, { status: 403 });

  const supabase = getServiceClient();
  const weekStart = getCurrentWeekStart();
  const weekEnd = format(
    new Date(new Date(weekStart).getTime() + 7 * 86400000),
    "yyyy-MM-dd"
  );

  const { data: goal } = await supabase
    .from("weekly_goals")
    .select("*")
    .eq("student_id", profile.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  const { count } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", profile.id)
    .in("status", ["submitted", "graded", "reviewed"])
    .gte("updated_at", weekStart)
    .lt("updated_at", weekEnd);

  return NextResponse.json({
    target: goal?.target ?? null,
    current: count ?? 0,
    week_start: weekStart,
    has_goal: !!goal,
  });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile || profile.role !== "student")
    return NextResponse.json({ error: "Student only" }, { status: 403 });

  const { target } = await req.json();
  const numTarget = Number(target);

  if (!numTarget || numTarget < 1 || numTarget > 50)
    return NextResponse.json(
      { error: "Target must be between 1 and 50" },
      { status: 400 }
    );

  const supabase = getServiceClient();
  const weekStart = getCurrentWeekStart();

  const { data, error } = await supabase
    .from("weekly_goals")
    .upsert(
      {
        student_id: profile.id,
        target: numTarget,
        week_start: weekStart,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,week_start" }
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
