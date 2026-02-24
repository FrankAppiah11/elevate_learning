import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getServiceClient } from "@/lib/supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignment_id } = await req.json();
  const supabase = getServiceClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignment_id)
    .single();

  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  const { data: grading } = await supabase
    .from("grading_results")
    .select("*")
    .eq("assignment_id", assignment_id)
    .single();

  const { data: interactions } = await supabase
    .from("tutor_interactions")
    .select("*")
    .eq("assignment_id", assignment_id)
    .order("created_at", { ascending: true });

  const { data: sessions } = await supabase
    .from("tutor_sessions")
    .select("*")
    .eq("assignment_id", assignment_id);

  const interactionText = (interactions || [])
    .map((i) => `[${i.role}] (${i.interaction_type}): ${i.content}`)
    .join("\n");

  const feedbackPrompt = `You are an expert educational evaluator generating a thorough feedback report for a student's assignment.

ASSIGNMENT: "${assignment.title}"
${assignment.description ? `Description: ${assignment.description}` : ""}

GRADING RESULTS:
- Problem Solving: ${grading?.problem_solving_score}/100 (60% weight)
- AI Competency: ${grading?.ai_competency_score}/100 (30% weight)
- Correctness: ${grading?.correctness_score}/100 (10% weight)
- Weighted Total: ${grading?.weighted_total}
- Letter Grade: ${grading?.letter_grade}

SESSION DATA:
${(sessions || []).map((s) => `Duration: ${s.duration_seconds}s, Messages: ${s.total_messages}, Go-backs: ${s.go_backs}`).join("\n")}

INTERACTION TRANSCRIPT:
${interactionText || "No interactions"}

Generate a comprehensive feedback report in this exact JSON format:
{
  "narrative_report": "<A 3-4 paragraph narrative assessment of the student's work, learning approach, and AI interaction quality. Use specific examples from the transcript. Write in third person. Include both praise and constructive feedback.>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_for_improvement": ["<area 1>", "<area 2>", "<area 3>"],
  "key_suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"],
  "competency_breakdown": {
    "logical_reasoning": <score 0-100>,
    "concept_integration": <score 0-100>,
    "formula_accuracy": <score 0-100>
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: feedbackPrompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    const { data: feedback, error } = await supabase
      .from("feedback_reports")
      .upsert(
        {
          assignment_id,
          student_id: assignment.student_id,
          narrative_report: result.narrative_report,
          strengths: result.strengths,
          areas_for_improvement: result.areas_for_improvement,
          key_suggestions: result.key_suggestions,
          competency_breakdown: result.competency_breakdown,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "assignment_id" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json({ error: "Feedback generation failed" }, { status: 500 });
  }
}
