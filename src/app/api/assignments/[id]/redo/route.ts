import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile || profile.role !== "instructor")
    return NextResponse.json({ error: "Instructor only" }, { status: 403 });

  const { id } = await params;
  const { reason } = await req.json();
  const supabase = getServiceClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, student_id, title")
    .eq("id", id)
    .single();

  if (!assignment)
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  await supabase
    .from("assignments")
    .update({
      status: "redo_requested",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await supabase.from("notifications").insert({
    user_id: assignment.student_id,
    title: "Redo Requested",
    message: reason
      ? `Your instructor has requested you redo "${assignment.title}": ${reason}`
      : `Your instructor has requested you redo "${assignment.title}". Please review the feedback and resubmit.`,
    type: "review",
    related_assignment_id: id,
  });

  return NextResponse.json({ success: true });
}
