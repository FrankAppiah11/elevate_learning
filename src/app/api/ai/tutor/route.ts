import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { getTutorById } from "@/lib/ai-tutors";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { tutor_id, messages, assignment_context, session_id, assignment_id } = body;

  const tutor = getTutorById(tutor_id);
  if (!tutor) return NextResponse.json({ error: "Invalid tutor" }, { status: 400 });

  const supabase = getServiceClient();
  const profile = await ensureProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const systemMessage = `${tutor.system_prompt}

ASSIGNMENT CONTEXT:
${assignment_context || "General learning assistance"}

CRITICAL GUARDRAILS:
1. You must NEVER provide direct answers to assignment questions.
2. You must NEVER write solutions, essays, code, or complete work for the student.
3. Always use DIFFERENT examples from the actual assignment to illustrate concepts.
4. If a student directly asks for the answer, redirect them with a guiding question.
5. Track the student's progress and adapt your guidance level accordingly.
6. If the student seems frustrated, offer encouragement and try a different teaching approach.
7. Keep responses focused and concise - under 150 words when possible.`;

  const chatMessages = [
    { role: "system" as const, content: systemMessage },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content || "I'm here to help. Could you rephrase your question?";

    const isGoBack = messages.length > 2 &&
      messages[messages.length - 1]?.content?.toLowerCase().includes("go back") ||
      messages[messages.length - 1]?.content?.toLowerCase().includes("previous") ||
      messages[messages.length - 1]?.content?.toLowerCase().includes("start over");

    if (session_id) {
      await supabase.from("tutor_interactions").insert([
        {
          session_id,
          assignment_id,
          student_id: profile.id,
          tutor_id,
          role: "student",
          content: messages[messages.length - 1]?.content,
          interaction_type: isGoBack ? "go_back" : "question",
        },
        {
          session_id,
          assignment_id,
          student_id: profile.id,
          tutor_id,
          role: "tutor",
          content: responseContent,
          interaction_type: determineInteractionType(responseContent),
        },
      ]);

      const sessionUpdate: Record<string, unknown> = {
        total_messages: messages.length + 1,
      };

      if (isGoBack) {
        const { data: currentSession } = await supabase
          .from("tutor_sessions")
          .select("go_backs")
          .eq("id", session_id)
          .single();
        sessionUpdate.go_backs = (currentSession?.go_backs || 0) + 1;
      }

      await supabase
        .from("tutor_sessions")
        .update(sessionUpdate)
        .eq("id", session_id);
    }

    return NextResponse.json({
      content: responseContent,
      tutor_id,
      interaction_type: determineInteractionType(responseContent),
    });
  } catch (error) {
    console.error("AI tutor error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}

function determineInteractionType(content: string): string {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("for example") || lowerContent.includes("consider this")) return "example";
  if (lowerContent.includes("hint:") || lowerContent.includes("here's a hint")) return "hint";
  if (lowerContent.includes("?")) return "clarification";
  return "answer";
}
