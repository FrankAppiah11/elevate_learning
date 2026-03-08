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
    .select("id")
    .eq("instructor_id", profile.id);

  const moduleIds = modules?.map((m) => m.id) || [];
  if (moduleIds.length === 0) return NextResponse.json([]);

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      status,
      folder_label,
      created_at,
      updated_at,
      module_id,
      student_id,
      profiles!assignments_student_id_fkey(id, full_name, email, avatar_url),
      modules!assignments_module_id_fkey(title, class_code),
      grading_results(weighted_total, letter_grade)
    `)
    .in("module_id", moduleIds)
    .in("status", ["submitted", "graded", "reviewed"])
    .order("updated_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const activities = (assignments || []).map((a) => {
    const student = a.profiles as unknown as Record<string, string> | null;
    const mod = a.modules as unknown as Record<string, string> | null;
    const gradingArr = a.grading_results as unknown as Record<string, unknown>[] | null;
    const grading = gradingArr && gradingArr.length > 0 ? gradingArr[0] : null;

    return {
      id: a.id,
      assignment_id: a.id,
      assignment_title: a.title,
      status: a.status,
      student_id: a.student_id,
      student_name: student?.full_name || "Unknown",
      student_email: student?.email || "",
      student_avatar: student?.avatar_url || null,
      course: mod?.title || "Unassigned",
      class_code: mod?.class_code || "",
      ai_score: grading ? Number(grading.weighted_total) : undefined,
      letter_grade: grading ? String(grading.letter_grade) : undefined,
      submitted_at: a.updated_at,
    };
  });

  return NextResponse.json(activities);
}
