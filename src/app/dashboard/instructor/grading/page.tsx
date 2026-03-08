"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ScoreCircle from "@/components/ui/ScoreCircle";
import {
  GraduationCap,
  Eye,
  Edit3,
  Send,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface GradeItem {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_name: string;
  student_email: string;
  status: string;
  course: string;
  ai_score?: number;
  letter_grade?: string;
  submitted_at: string;
}

export default function GradingPage() {
  const [items, setItems] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeModal, setGradeModal] = useState<GradeItem | null>(null);
  const [instructorGrade, setInstructorGrade] = useState("");
  const [instructorNotes, setInstructorNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/instructor/activities");
        if (res.ok) {
          const data: GradeItem[] = await res.json();
          setItems(data);
        }
      } catch {}
      setLoading(false);
    }
    fetchData();
  }, []);

  const pending = items.filter((i) => i.status === "submitted" || i.status === "graded");

  async function submitGrade() {
    if (!gradeModal || !instructorGrade.trim()) {
      toast.error("Please enter a grade");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/assignments/${gradeModal.assignment_id}/grade`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor_grade: instructorGrade,
            instructor_notes: instructorNotes,
          }),
        }
      );

      if (res.ok) {
        toast.success(`Grade submitted for ${gradeModal.student_name}`);
        setItems((prev) =>
          prev.map((i) =>
            i.id === gradeModal.id ? { ...i, status: "reviewed" } : i
          )
        );
        setGradeModal(null);
        setInstructorGrade("");
        setInstructorNotes("");
      } else {
        toast.error("Failed to submit grade");
      }
    } catch {
      toast.error("Error submitting grade");
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <AppShell role="instructor" title="Grading">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-white">Pending Grades</h1>
          <p className="text-sm text-slate-400">
            {pending.length} assignment{pending.length !== 1 ? "s" : ""} awaiting
            your review
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <Card className="p-8 text-center">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              No assignments to grade right now. Check back when students submit work.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <Card key={item.id} className="p-5 hover:border-slate-600 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {item.student_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">
                        {item.student_name}
                      </h3>
                      <Badge
                        variant={item.status === "submitted" ? "warning" : "info"}
                        size="sm"
                      >
                        {item.status === "submitted" ? "Pending Grade" : "AI Graded"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{item.course}</p>
                    <p className="text-sm text-slate-300 mt-1">
                      {item.assignment_title}
                    </p>

                    {item.ai_score !== undefined && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="text-center">
                          <ScoreCircle score={Math.round(item.ai_score)} size="sm" />
                          <p className="text-[10px] text-slate-500 mt-1">AI Score</p>
                        </div>
                        {item.letter_grade && (
                          <Badge variant="info" size="md">
                            {item.letter_grade}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <p className="text-xs text-slate-500">
                      {timeAgo(item.submitted_at)}
                    </p>
                    <Button size="sm" onClick={() => setGradeModal(item)}>
                      <Edit3 className="w-3.5 h-3.5" />
                      Grade
                    </Button>
                    <Link href={`/assignments/${item.assignment_id}/feedback`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={!!gradeModal}
          onClose={() => setGradeModal(null)}
          title={`Grade: ${gradeModal?.student_name}`}
          className="max-w-md"
        >
          {gradeModal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">
                  {gradeModal.assignment_title}
                </p>
                {gradeModal.ai_score !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-slate-400">AI Suggested:</span>
                    <Badge variant="info" size="md">
                      {gradeModal.letter_grade || "—"} (
                      {Math.round(gradeModal.ai_score)}%)
                    </Badge>
                  </div>
                )}
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
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setGradeModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={submitGrade}
                  loading={submitting}
                >
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
