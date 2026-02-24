"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ScoreCircle from "@/components/ui/ScoreCircle";
import {
  GraduationCap,
  Eye,
  CheckCircle2,
  Edit3,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface PendingGrade {
  id: string;
  student_name: string;
  assignment_title: string;
  assignment_id: string;
  ai_grade: string;
  ai_score: number;
  problem_solving: number;
  ai_competency: number;
  correctness: number;
  submitted_at: string;
}

export default function GradingPage() {
  const [gradeModal, setGradeModal] = useState<PendingGrade | null>(null);
  const [instructorGrade, setInstructorGrade] = useState("");
  const [instructorNotes, setInstructorNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pending: PendingGrade[] = [
    {
      id: "1",
      student_name: "Marcus Chen",
      assignment_title: "Protein Synthesis Analysis",
      assignment_id: "a1",
      ai_grade: "A-",
      ai_score: 92,
      problem_solving: 90,
      ai_competency: 95,
      correctness: 88,
      submitted_at: "2h ago",
    },
    {
      id: "2",
      student_name: "Elena Rodriguez",
      assignment_title: "Taylor Series Expansion",
      assignment_id: "a2",
      ai_grade: "B+",
      ai_score: 78,
      problem_solving: 75,
      ai_competency: 82,
      correctness: 72,
      submitted_at: "5h ago",
    },
    {
      id: "3",
      student_name: "Jordan Smith",
      assignment_title: "Linear Algebra Intro",
      assignment_id: "a3",
      ai_grade: "C+",
      ai_score: 65,
      problem_solving: 60,
      ai_competency: 70,
      correctness: 55,
      submitted_at: "1d ago",
    },
  ];

  async function submitGrade() {
    if (!gradeModal || !instructorGrade.trim()) {
      toast.error("Please enter a grade");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${gradeModal.assignment_id}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_grade: instructorGrade,
          instructor_notes: instructorNotes,
        }),
      });

      if (res.ok) {
        toast.success(`Grade submitted for ${gradeModal.student_name}`);
        setGradeModal(null);
        setInstructorGrade("");
        setInstructorNotes("");
      } else {
        toast.error("Failed to submit grade");
      }
    } catch (err) {
      toast.error("Error submitting grade");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell role="instructor" title="Grading">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Pending Grades</h1>
            <p className="text-sm text-slate-400">{pending.length} assignments awaiting your review</p>
          </div>
        </div>

        {/* Grading Queue */}
        <div className="space-y-3">
          {pending.map((item) => (
            <Card key={item.id} className="p-5 hover:border-slate-600 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {item.student_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white">{item.student_name}</h3>
                    <Badge variant="warning" size="sm">Pending Grade</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{item.assignment_title}</p>

                  {/* AI Scores Preview */}
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div className="text-center">
                      <ScoreCircle score={item.ai_score} size="sm" />
                      <p className="text-[10px] text-slate-500 mt-1">Overall</p>
                    </div>
                    <div className="text-center">
                      <ScoreCircle score={item.problem_solving} size="sm" />
                      <p className="text-[10px] text-slate-500 mt-1">Problem Solving</p>
                    </div>
                    <div className="text-center">
                      <ScoreCircle score={item.ai_competency} size="sm" />
                      <p className="text-[10px] text-slate-500 mt-1">AI Competency</p>
                    </div>
                    <div className="text-center">
                      <ScoreCircle score={item.correctness} size="sm" />
                      <p className="text-[10px] text-slate-500 mt-1">Correctness</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <p className="text-xs text-slate-500">{item.submitted_at}</p>
                  <Button size="sm" onClick={() => setGradeModal(item)}>
                    <Edit3 className="w-3.5 h-3.5" />
                    Grade
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-3.5 h-3.5" />
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Grading Modal */}
        <Modal
          open={!!gradeModal}
          onClose={() => setGradeModal(null)}
          title={`Grade: ${gradeModal?.student_name}`}
          className="max-w-md"
        >
          {gradeModal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">{gradeModal.assignment_title}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-slate-400">AI Suggested:</span>
                  <Badge variant="info" size="md">{gradeModal.ai_grade} ({gradeModal.ai_score}%)</Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Grade
                </label>
                <input
                  type="text"
                  value={instructorGrade}
                  onChange={(e) => setInstructorGrade(e.target.value)}
                  placeholder="e.g., A-, B+, 85"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes for Student (optional)
                </label>
                <textarea
                  value={instructorNotes}
                  onChange={(e) => setInstructorNotes(e.target.value)}
                  placeholder="Additional feedback or notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setGradeModal(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={submitGrade} loading={submitting}>
                  <Send className="w-4 h-4" />
                  Submit Grade
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
