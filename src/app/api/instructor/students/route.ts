import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile || profile.role !== "instructor")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getServiceClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, class_code")
    .eq("instructor_id", profile.id);

  const moduleIds = modules?.map((m) => m.id) || [];
  if (moduleIds.length === 0) return NextResponse.json([]);

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select(`
      module_id,
      enrolled_at,
      profiles!enrollments_student_id_fkey(id, full_name, email, avatar_url)
    `)
    .in("module_id", moduleIds);

  if (enrollError)
    return NextResponse.json({ error: enrollError.message }, { status: 500 });

  const moduleMap = new Map(
    (modules || []).map((m) => [m.id, { title: m.title, class_code: m.class_code }])
  );

  const studentIds = new Set<string>();
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
      classes: string[];
      enrolled_at: string;
    }
  >();

  for (const e of enrollments || []) {
    const student = e.profiles as unknown as Record<string, string> | null;
    if (!student) continue;
    const sid = student.id;
    const mod = moduleMap.get(e.module_id);

    if (studentMap.has(sid)) {
      const existing = studentMap.get(sid)!;
      if (mod) existing.classes.push(mod.title);
    } else {
      studentMap.set(sid, {
        id: sid,
        name: student.full_name || "Unknown",
        email: student.email || "",
        avatar_url: student.avatar_url || null,
        classes: mod ? [mod.title] : [],
        enrolled_at: e.enrolled_at,
      });
    }
    studentIds.add(sid);
  }

  if (studentIds.size === 0)
    return NextResponse.json([]);

  const { data: assignmentCounts } = await supabase
    .from("assignments")
    .select("student_id, status")
    .in("module_id", moduleIds)
    .in("student_id", Array.from(studentIds));

  const { data: gradingData } = await supabase
    .from("grading_results")
    .select("student_id, weighted_total")
    .in("student_id", Array.from(studentIds));

  const studentStats = new Map<
    string,
    { total: number; completed: number; grades: number[] }
  >();

  for (const a of assignmentCounts || []) {
    const s = studentStats.get(a.student_id) || {
      total: 0,
      completed: 0,
      grades: [],
    };
    s.total++;
    if (["graded", "reviewed"].includes(a.status)) s.completed++;
    studentStats.set(a.student_id, s);
  }

  for (const g of gradingData || []) {
    const s = studentStats.get(g.student_id) || {
      total: 0,
      completed: 0,
      grades: [],
    };
    s.grades.push(Number(g.weighted_total));
    studentStats.set(g.student_id, s);
  }

  const students = Array.from(studentMap.values()).map((s) => {
    const stats = studentStats.get(s.id);
    const avgScore =
      stats && stats.grades.length > 0
        ? Math.round(
            stats.grades.reduce((a, b) => a + b, 0) / stats.grades.length
          )
        : null;

    return {
      ...s,
      assignments_total: stats?.total ?? 0,
      assignments_completed: stats?.completed ?? 0,
      avg_score: avgScore,
    };
  });

  return NextResponse.json(students);
}
