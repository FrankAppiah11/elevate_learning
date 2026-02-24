import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { interactions, duration_seconds, tutor_id } = body;
  const supabase = getServiceClient();

  const profile = await ensureProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, student_id, instructor_id, title")
    .eq("id", id)
    .single();

  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  const goBackCount = (interactions || []).filter(
    (i: { interaction_type: string }) => i.interaction_type === "go_back"
  ).length;

  const { data: session } = await supabase
    .from("tutor_sessions")
    .insert({
      assignment_id: id,
      student_id: profile.id,
      tutor_id: tutor_id || "socratic-sam",
      started_at: new Date(Date.now() - (duration_seconds || 0) * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: duration_seconds || 0,
      total_messages: (interactions || []).length,
      go_backs: goBackCount,
      status: "completed",
    })
    .select()
    .single();

  if (session && interactions && interactions.length > 0) {
    const interactionRows = interactions.map(
      (i: { role: string; content: string; interaction_type: string; timestamp: string }) => ({
        session_id: session.id,
        assignment_id: id,
        student_id: profile.id,
        tutor_id: tutor_id || "socratic-sam",
        role: i.role,
        content: i.content,
        interaction_type: i.interaction_type,
        created_at: i.timestamp,
      })
    );

    await supabase.from("tutor_interactions").insert(interactionRows);
  }

  await supabase
    .from("assignments")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (assignment.instructor_id) {
    await supabase.from("notifications").insert({
      user_id: assignment.instructor_id,
      title: "Assignment Submitted for Review",
      message: `A student has submitted "${assignment.title}" and is ready for your review.`,
      type: "submission",
      related_assignment_id: id,
    });
  } else {
    const { data: instructors } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "instructor")
      .limit(5);

    if (instructors && instructors.length > 0) {
      const notifications = instructors.map((instructor) => ({
        user_id: instructor.id,
        title: "New Assignment Submission",
        message: `A student has submitted "${assignment.title}" and is ready for review.`,
        type: "submission" as const,
        related_assignment_id: id,
      }));
      await supabase.from("notifications").insert(notifications);
    }
  }

  return NextResponse.json({
    success: true,
    session_id: session?.id,
    message: "Work submitted and instructor notified",
  });
}
