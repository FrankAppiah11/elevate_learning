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

  if (profile.role === "student") {
    const { data, error } = await supabase
      .from("assignments")
      .select("*, grading_results(weighted_total, letter_grade, problem_solving_score, ai_competency_score, correctness_score, instructor_grade, instructor_notes, instructor_graded_at)")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const enriched = (data || []).map((a) => {
      const raw = a.grading_results as unknown;
      let grading: Record<string, unknown> | null = null;
      if (Array.isArray(raw) && raw.length > 0) {
        grading = raw[0] as Record<string, unknown>;
      } else if (raw && typeof raw === "object" && !Array.isArray(raw) && Object.keys(raw as object).length > 0) {
        grading = raw as Record<string, unknown>;
      }

      return {
        ...a,
        grading_results: undefined,
        ai_score: grading ? Number(grading.weighted_total) : null,
        letter_grade: grading ? String(grading.letter_grade) : null,
        problem_solving_score: grading ? Number(grading.problem_solving_score) : null,
        ai_competency_score: grading ? Number(grading.ai_competency_score) : null,
        correctness_score: grading ? Number(grading.correctness_score) : null,
        instructor_grade: grading ? (grading.instructor_grade as string | null) : null,
        instructor_notes: grading ? (grading.instructor_notes as string | null) : null,
      };
    });

    return NextResponse.json(enriched);
  }

  // Instructor: get assignments from all their classes
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("instructor_id", profile.id);

  const moduleIds = modules?.map((m) => m.id) || [];

  let query = supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (moduleIds.length > 0) {
    query = query.or(
      `instructor_id.eq.${profile.id},module_id.in.(${moduleIds.join(",")})`
    );
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
