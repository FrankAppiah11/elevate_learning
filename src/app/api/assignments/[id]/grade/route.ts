import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("grading_results")
    .select("*")
    .eq("assignment_id", id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("grading_results")
    .update({
      instructor_grade: body.instructor_grade,
      instructor_notes: body.instructor_notes,
      instructor_graded_at: new Date().toISOString(),
    })
    .eq("assignment_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("assignments")
    .update({ status: "reviewed" })
    .eq("id", id);

  return NextResponse.json(data);
}
