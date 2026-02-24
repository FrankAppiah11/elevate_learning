import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: sessions } = await supabase
    .from("tutor_sessions")
    .select("*")
    .eq("assignment_id", id)
    .order("started_at", { ascending: false });

  const { data: interactions } = await supabase
    .from("tutor_interactions")
    .select("*")
    .eq("assignment_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    sessions: sessions || [],
    interactions: interactions || [],
    summary: {
      total_sessions: sessions?.length || 0,
      total_messages: interactions?.length || 0,
      total_duration: sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0,
      total_go_backs: sessions?.reduce((acc, s) => acc + (s.go_backs || 0), 0) || 0,
      student_messages: interactions?.filter((i) => i.role === "student").length || 0,
      tutor_messages: interactions?.filter((i) => i.role === "tutor").length || 0,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { interaction_id, content } = await req.json();
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("tutor_interactions")
    .update({ content })
    .eq("id", interaction_id)
    .eq("assignment_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
