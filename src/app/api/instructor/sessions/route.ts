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
    .select("id, title")
    .eq("instructor_id", profile.id);

  const moduleIds = modules?.map((m) => m.id) || [];
  if (moduleIds.length === 0) return NextResponse.json([]);

  const moduleMap = new Map(
    (modules || []).map((m) => [m.id, m.title])
  );

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, module_id, student_id")
    .in("module_id", moduleIds);

  if (!assignments || assignments.length === 0)
    return NextResponse.json([]);

  const assignmentIds = assignments.map((a) => a.id);
  const assignmentMap = new Map(
    assignments.map((a) => [
      a.id,
      {
        title: a.title,
        module_id: a.module_id,
        student_id: a.student_id,
      },
    ])
  );

  const studentIds = [...new Set(assignments.map((a) => a.student_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", studentIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { name: p.full_name, email: p.email }])
  );

  const { data: sessions, error } = await supabase
    .from("tutor_sessions")
    .select("*")
    .in("assignment_id", assignmentIds)
    .order("started_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (sessions || []).map((s) => {
    const assignment = assignmentMap.get(s.assignment_id);
    const student = assignment
      ? profileMap.get(assignment.student_id)
      : null;
    const courseName = assignment?.module_id
      ? moduleMap.get(assignment.module_id) || ""
      : "";

    return {
      id: s.id,
      assignment_id: s.assignment_id,
      assignment_title: assignment?.title || "Unknown",
      student_name: student?.name || "Unknown",
      student_email: student?.email || "",
      tutor_id: s.tutor_id,
      duration_seconds: s.duration_seconds || 0,
      total_messages: s.total_messages || 0,
      go_backs: s.go_backs || 0,
      status: s.status,
      started_at: s.started_at,
      course: courseName,
    };
  });

  return NextResponse.json(result);
}
