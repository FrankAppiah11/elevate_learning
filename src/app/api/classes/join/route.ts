import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await ensureProfile(userId);
  if (!profile)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (profile.role !== "student") {
    return NextResponse.json(
      { error: "Only students can join classes" },
      { status: 403 }
    );
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json(
      { error: "Class code is required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  const { data: module, error: moduleError } = await supabase
    .from("modules")
    .select("*, profiles!modules_instructor_id_fkey(full_name)")
    .eq("class_code", code.toUpperCase().trim())
    .single();

  if (moduleError || !module) {
    return NextResponse.json(
      { error: "Invalid class code. Please check with your instructor." },
      { status: 404 }
    );
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", profile.id)
    .eq("module_id", module.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You are already enrolled in this class." },
      { status: 409 }
    );
  }

  const { error: enrollError } = await supabase.from("enrollments").insert({
    student_id: profile.id,
    module_id: module.id,
  });

  if (enrollError)
    return NextResponse.json({ error: enrollError.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    class: {
      id: module.id,
      title: module.title,
      description: module.description,
      instructor_name: module.profiles?.full_name || "Unknown",
      class_code: module.class_code,
    },
  });
}
