import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { startOfWeek, format, endOfWeek } from "date-fns";
import { sendGoalReminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const dayOfWeek = now.getDay();

  const isEndOfWeek = dayOfWeek === 5 || dayOfWeek === 0;

  const { data: goals } = await supabase
    .from("weekly_goals")
    .select("*, profiles!inner(id, email, full_name)")
    .eq("week_start", weekStart);

  if (!goals || goals.length === 0) {
    return NextResponse.json({ message: "No goals to check", notified: 0 });
  }

  let notified = 0;

  for (const goal of goals) {
    const profile = goal.profiles as unknown as {
      id: string;
      email: string;
      full_name: string;
    };

    const { count } = await supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .in("status", ["submitted", "graded", "reviewed"])
      .gte("updated_at", weekStart)
      .lt("updated_at", weekEnd);

    const current = count ?? 0;
    const target = goal.target;

    if (current >= target) continue;

    const remaining = target - current;
    const pctComplete = Math.round((current / target) * 100);

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", profile.id)
      .eq("type", "goal_reminder")
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) continue;

    const title = isEndOfWeek
      ? "Weekly Goal Reminder - Time Running Out!"
      : "Weekly Goal Check-In";
    const message = isEndOfWeek
      ? `You've completed ${current} of ${target} assignments this week (${pctComplete}%). Only ${remaining} more to go — the week ends soon!`
      : `You've completed ${current} of ${target} assignments this week (${pctComplete}%). Keep going — ${remaining} more to hit your goal!`;

    await supabase.from("notifications").insert({
      user_id: profile.id,
      title,
      message,
      type: "goal_reminder",
    });

    await sendGoalReminderEmail({
      to: profile.email,
      name: profile.full_name,
      current,
      target,
      remaining,
      isUrgent: isEndOfWeek,
    });

    notified++;
  }

  return NextResponse.json({ message: "Goal check complete", notified });
}
