import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { generateFolderLabel } from "@/lib/utils";
import { ensureProfile } from "@/lib/ensure-profile";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const supabase = getServiceClient();
  let query = supabase.from("assignments").select("*").order("created_at", { ascending: false });

  if (profile.role === "student") {
    query = query.eq("student_id", profile.id);
  } else {
    query = query.eq("instructor_id", profile.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const supabase = getServiceClient();
  const body = await req.json();
  const folderLabel = generateFolderLabel(body.title, new Date());

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      title: body.title,
      description: body.description,
      student_id: profile.id,
      instructor_id: body.instructor_id || null,
      module_id: body.module_id || null,
      upload_type: body.upload_type,
      file_url: body.file_url || null,
      file_name: body.file_name || null,
      text_content: body.text_content || null,
      web_url: body.web_url || null,
      status: "draft",
      folder_label: folderLabel,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
