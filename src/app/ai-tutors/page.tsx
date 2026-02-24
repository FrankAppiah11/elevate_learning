"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AI_TUTORS } from "@/lib/ai-tutors";
import { MessageCircle, Shield, Brain, Sparkles } from "lucide-react";

export default function AITutorsPage() {
  return (
    <AppShell role="student" title="AI Tutors">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Meet Your AI Tutors</h1>
          <p className="text-slate-400">
            Our tutors guide you to understanding — they never just give answers.
            Each has a unique teaching style designed to support your learning journey.
          </p>
        </div>

        {/* Guardrails Info */}
        <Card variant="highlight" className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Built-in Learning Guardrails</h3>
              <ul className="text-sm text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Tutors never provide direct answers to assignment questions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  They use different examples to illustrate concepts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Each interaction is tracked for comprehensive grading
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  30% of your grade is based on how effectively you use the AI
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Tutor Cards */}
        <div className="space-y-4">
          {AI_TUTORS.map((tutor) => (
            <Card key={tutor.id} className="p-6 hover:border-slate-600 transition-all">
              <div className="flex items-start gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                  style={{ backgroundColor: tutor.avatar_color + "20", color: tutor.avatar_color }}
                >
                  {tutor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{tutor.name}</h3>
                    <Badge
                      variant={
                        tutor.style === "socratic"
                          ? "purple"
                          : tutor.style === "structured"
                          ? "info"
                          : "success"
                      }
                      size="md"
                    >
                      {tutor.style}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{tutor.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Guided questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" />
                      {tutor.style === "socratic"
                        ? "Discovery learning"
                        : tutor.style === "structured"
                        ? "Step-by-step"
                        : "Multi-path exploration"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Custom examples
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
