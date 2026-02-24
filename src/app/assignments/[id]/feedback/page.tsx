"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ScoreCircle from "@/components/ui/ScoreCircle";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  ArrowLeft,
  Share2,
  Star,
  TrendingUp,
  Lightbulb,
  FileText,
  ChevronRight,
  User,
} from "lucide-react";

interface GradingData {
  problem_solving_score: number;
  ai_competency_score: number;
  correctness_score: number;
  weighted_total: number;
  letter_grade: string;
  grading_details: {
    problem_solving_analysis: string;
    ai_competency_analysis: string;
    correctness_analysis: string;
  };
  instructor_grade?: string;
  instructor_notes?: string;
}

interface FeedbackData {
  narrative_report: string;
  strengths: string[];
  areas_for_improvement: string[];
  key_suggestions: string[];
  competency_breakdown: {
    logical_reasoning: number;
    concept_integration: number;
    formula_accuracy: number;
  };
}

interface AssignmentData {
  id: string;
  title: string;
  folder_label: string;
  status: string;
}

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [grading, setGrading] = useState<GradingData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [assignRes, gradeRes, feedbackRes] = await Promise.all([
        fetch(`/api/assignments/${id}`),
        fetch(`/api/assignments/${id}/grade`),
        fetch(`/api/assignments/${id}/feedback`),
      ]);

      if (assignRes.ok) setAssignment(await assignRes.json());
      if (gradeRes.ok) setGrading(await gradeRes.json());
      if (feedbackRes.ok) setFeedback(await feedbackRes.json());
    } catch (err) {
      console.error("Failed to fetch feedback data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const mockGrading: GradingData = grading || {
    problem_solving_score: 60,
    ai_competency_score: 30,
    correctness_score: 10,
    weighted_total: 78,
    letter_grade: "B+",
    grading_details: {
      problem_solving_analysis: "Demonstrated strong analytical thinking with systematic problem decomposition.",
      ai_competency_analysis: "Asked targeted questions that effectively leveraged AI guidance for learning.",
      correctness_analysis: "Final conclusions were mostly accurate with minor computational oversights.",
    },
    instructor_grade: undefined,
    instructor_notes: undefined,
  };

  const mockFeedback: FeedbackData = feedback || {
    narrative_report:
      'Your approach to the multi-variable integration problems shows a strong grasp of fundamental concepts. However, the AI tutor noted a recurring error in the Jacobian transformations.\n\n"The student effectively leveraged the AI-assisted visualization tools to map the vector fields, which contributed to their high AI Competency score."',
    strengths: ["Strong analytical thinking", "Effective use of AI guidance", "Good concept integration"],
    areas_for_improvement: ["Jacobian transformation accuracy", "Double-checking boundary conditions"],
    key_suggestions: [
      "Review polar coordinate mapping techniques for next week's quiz.",
      "Practice Jacobian transformations with simpler examples first.",
    ],
    competency_breakdown: {
      logical_reasoning: 85,
      concept_integration: 72,
      formula_accuracy: 45,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student">
              <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            </Link>
            <div>
              <Badge variant="success" size="sm">AI Generated</Badge>
              <h1 className="text-lg font-bold text-white mt-1">Grading Report</h1>
              <p className="text-xs text-slate-400">
                {assignment?.title || "Assignment"} — {assignment?.folder_label}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Share2 className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6 pb-24 animate-fade-in">
        {/* Score Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <ScoreCircle score={mockGrading.problem_solving_score} size="sm" />
            <p className="text-xs text-slate-400 mt-2">Problem Solving</p>
            <p className="text-lg font-bold text-white">{mockGrading.problem_solving_score}%</p>
          </Card>
          <Card className="p-4 text-center">
            <ScoreCircle score={mockGrading.ai_competency_score} size="sm" />
            <p className="text-xs text-slate-400 mt-2">AI Competency</p>
            <p className="text-lg font-bold text-white">{mockGrading.ai_competency_score}%</p>
          </Card>
          <Card className="p-4 text-center">
            <ScoreCircle score={mockGrading.correctness_score} size="sm" />
            <p className="text-xs text-slate-400 mt-2">Correctness</p>
            <p className="text-lg font-bold text-white">{mockGrading.correctness_score}%</p>
          </Card>
        </div>

        {/* Weighted Grade */}
        <Card variant="highlight" className="p-6 text-center">
          <div className="flex items-center justify-center gap-6">
            <ScoreCircle
              score={mockGrading.weighted_total}
              size="lg"
              grade={mockGrading.letter_grade}
              label="Weighted Avg"
            />
            <div className="text-left">
              <p className="text-sm text-slate-400">Overall Score</p>
              <p className="text-3xl font-bold text-white">{mockGrading.weighted_total}%</p>
              <Badge variant="info" size="md">
                {mockGrading.letter_grade}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Competency Breakdown */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Competency Breakdown
          </h2>
          <div className="space-y-4">
            {[
              { label: "Logical Reasoning", value: mockFeedback.competency_breakdown.logical_reasoning, color: "indigo" as const },
              { label: "Concept Integration", value: mockFeedback.competency_breakdown.concept_integration, color: "blue" as const },
              { label: "Formula Accuracy", value: mockFeedback.competency_breakdown.formula_accuracy, color: "amber" as const },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-white font-medium">{item.value}/100</span>
                </div>
                <ProgressBar value={item.value} color={item.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* AI Narrative Report */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            AI Narrative Report
            <Link href="#" className="text-xs text-indigo-400 ml-auto hover:text-indigo-300">
              Details
            </Link>
          </h2>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            {mockFeedback.narrative_report.split("\n\n").map((paragraph, i) => (
              <p key={i}>
                {paragraph.startsWith('"') ? (
                  <span className="italic border-l-2 border-indigo-500 pl-3 block text-slate-400">
                    {paragraph}
                  </span>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>
        </Card>

        {/* Key Suggestions */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Key Suggestions
          </h2>
          <div className="space-y-3">
            {mockFeedback.key_suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-amber-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructor Grade Section */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4">
            Instructor&apos;s Final Grade
          </h2>
          {mockGrading.instructor_grade ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{mockGrading.instructor_grade}</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Prof. Instructor</p>
                <p className="text-xs text-slate-400">{mockGrading.instructor_notes}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-dashed border-slate-700">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Pending instructor review</p>
                <p className="text-xs text-slate-500">You&apos;ll be notified when your grade is available</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
