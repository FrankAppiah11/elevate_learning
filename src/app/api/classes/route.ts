import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";
import { generateUniqueClassCode } from "@/lib/class-code";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const supabase = getServiceClient();

  if (profile.role === "instructor") {
    const { data, error } = await supabase
      .from("modules")
      .select("*, enrollments(count)")
      .eq("instructor_id", profile.id)
      .order("created_at", { ascending: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("module_id, modules(*, profiles!modules_instructor_id_fkey(full_name, email))")
    .eq("student_id", profile.id);

  if (enrollError)
    return NextResponse.json({ error: enrollError.message }, { status: 500 });

  const classes = enrollments?.map((e) => e.modules) || [];
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (profile.role !== "instructor") {
    return NextResponse.json(
      { error: "Only instructors can create classes" },
      { status: 403 }
    );
  }

  const { title, description } = await req.json();
  if (!title) {
    return NextResponse.json(
      { error: "Class title is required" },
      { status: 400 }
    );
  }

  const classCode = await generateUniqueClassCode();
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("modules")
    .insert({
      title,
      description: description || null,
      instructor_id: profile.id,
      class_code: classCode,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
