import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getServiceClient } from "@/lib/supabase";
import { getLetterGrade } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignment_id } = await req.json();
  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignment_id)
    .single();

  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

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
    .map((i) => `[${i.role.toUpperCase()}] (${i.interaction_type}): ${i.content}`)
    .join("\n");

  const sessionSummary = (sessions || [])
    .map(
      (s) =>
        `Session: ${s.duration_seconds}s, ${s.total_messages} messages, ${s.go_backs} go-backs`
    )
    .join("\n");

  const gradingPrompt = `You are an expert educational assessor. Grade the following student-AI tutor interaction based on these criteria:

GRADING SCHEME:
- Problem Solving Abilities (60% weight): Evaluate the student's approach to breaking down problems, their logical reasoning, ability to apply concepts, and progression toward solutions. Score 0-100.
- AI Competency (30% weight): Evaluate how effectively the student used the AI tutor — quality of questions asked, ability to build on AI guidance, strategic use of hints/examples, and demonstration of critical thinking. Score 0-100.
- Correctness (10% weight): Evaluate the accuracy of the student's final understanding and conclusions. Score 0-100.

ASSIGNMENT CONTEXT:
Title: ${assignment.title}
Description: ${assignment.description || "N/A"}
Content: ${assignment.text_content || "See uploaded file"}

SESSION SUMMARY:
${sessionSummary || "No session data"}

FULL INTERACTION TRANSCRIPT:
${interactionText || "No interactions recorded"}

Respond in this exact JSON format:
{
  "problem_solving_score": <number 0-100>,
  "ai_competency_score": <number 0-100>,
  "correctness_score": <number 0-100>,
  "problem_solving_analysis": "<2-3 sentence analysis>",
  "ai_competency_analysis": "<2-3 sentence analysis>",
  "correctness_analysis": "<2-3 sentence analysis>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: gradingPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    const weightedTotal =
      result.problem_solving_score * 0.6 +
      result.ai_competency_score * 0.3 +
      result.correctness_score * 0.1;

    const letterGrade = getLetterGrade(weightedTotal);

    const { data: gradingResult, error } = await supabase
      .from("grading_results")
      .upsert(
        {
          assignment_id,
          student_id: assignment.student_id,
          problem_solving_score: result.problem_solving_score,
          ai_competency_score: result.ai_competency_score,
          correctness_score: result.correctness_score,
          weighted_total: Math.round(weightedTotal * 100) / 100,
          letter_grade: letterGrade,
          grading_details: {
            problem_solving_analysis: result.problem_solving_analysis,
            ai_competency_analysis: result.ai_competency_analysis,
            correctness_analysis: result.correctness_analysis,
          },
          ai_graded_at: new Date().toISOString(),
        },
        { onConflict: "assignment_id" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase
      .from("assignments")
      .update({ status: "graded", updated_at: new Date().toISOString() })
      .eq("id", assignment_id);

    return NextResponse.json(gradingResult);
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
