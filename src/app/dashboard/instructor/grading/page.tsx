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
  Download,
  Paperclip,
  RotateCcw,
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
  problem_solving?: number;
  ai_competency?: number;
  correctness?: number;
  completed_file_url?: string | null;
  completed_file_name?: string | null;
  submitted_at: string;
}

export default function GradingPage() {
  const [items, setItems] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeModal, setGradeModal] = useState<GradeItem | null>(null);
  const [instructorGrade, setInstructorGrade] = useState("");
  const [instructorNotes, setInstructorNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestingRedo, setRequestingRedo] = useState(false);
  const [redoReason, setRedoReason] = useState("");

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

  async function requestRedo() {
    if (!gradeModal) return;
    setRequestingRedo(true);
    try {
      const res = await fetch(
        `/api/assignments/${gradeModal.assignment_id}/redo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: redoReason }),
        }
      );

      if (res.ok) {
        toast.success(`Redo requested for ${gradeModal.student_name}`);
        setItems((prev) =>
          prev.filter((i) => i.id !== gradeModal.id)
        );
        setGradeModal(null);
        setRedoReason("");
      } else {
        toast.error("Failed to request redo");
      }
    } catch {
      toast.error("Error requesting redo");
    } finally {
      setRequestingRedo(false);
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

                    {item.completed_file_url && (
                      <div className="mt-2">
                        <a
                          href={item.completed_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-600/10 px-2.5 py-1.5 rounded-lg"
                        >
                          <Paperclip className="w-3 h-3" />
                          {item.completed_file_name || "Completed work"}
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {item.ai_score !== undefined && (
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-center">
                          <ScoreCircle score={Math.round(item.ai_score)} size="sm" />
                          <p className="text-[10px] text-slate-500 mt-1">Overall</p>
                        </div>
                        {item.problem_solving !== undefined && (
                          <div className="text-center">
                            <ScoreCircle score={Math.round(item.problem_solving)} size="sm" />
                            <p className="text-[10px] text-slate-500 mt-1">Problem Solving</p>
                          </div>
                        )}
                        {item.ai_competency !== undefined && (
                          <div className="text-center">
                            <ScoreCircle score={Math.round(item.ai_competency)} size="sm" />
                            <p className="text-[10px] text-slate-500 mt-1">AI Competency</p>
                          </div>
                        )}
                        {item.correctness !== undefined && (
                          <div className="text-center">
                            <ScoreCircle score={Math.round(item.correctness)} size="sm" />
                            <p className="text-[10px] text-slate-500 mt-1">Correctness</p>
                          </div>
                        )}
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
                <p className="text-sm text-slate-400 mb-3">
                  {gradeModal.assignment_title}
                </p>

                {gradeModal.completed_file_url && (
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                      Student&apos;s Completed Work
                    </p>
                    <a
                      href={gradeModal.completed_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
                    >
                      <FileCheck className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm text-white flex-1 truncate">
                        {gradeModal.completed_file_name || "Completed assignment"}
                      </span>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </a>
                  </div>
                )}

                {gradeModal.ai_score !== undefined && (
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        AI Assessment
                      </span>
                      {gradeModal.letter_grade && (
                        <Badge variant="info" size="md">
                          {gradeModal.letter_grade}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <ScoreCircle score={Math.round(gradeModal.ai_score)} size="sm" />
                        <p className="text-[10px] text-slate-400 mt-1">Overall</p>
                      </div>
                      {gradeModal.problem_solving !== undefined && (
                        <div>
                          <ScoreCircle score={Math.round(gradeModal.problem_solving)} size="sm" />
                          <p className="text-[10px] text-slate-400 mt-1">Problem Solving</p>
                        </div>
                      )}
                      {gradeModal.ai_competency !== undefined && (
                        <div>
                          <ScoreCircle score={Math.round(gradeModal.ai_competency)} size="sm" />
                          <p className="text-[10px] text-slate-400 mt-1">AI Competency</p>
                        </div>
                      )}
                      {gradeModal.correctness !== undefined && (
                        <div>
                          <ScoreCircle score={Math.round(gradeModal.correctness)} size="sm" />
                          <p className="text-[10px] text-slate-400 mt-1">Correctness</p>
                        </div>
                      )}
                    </div>
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

              {/* Request Redo Section */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Request student redo instead
                </summary>
                <div className="mt-3 space-y-3 pl-1">
                  <textarea
                    value={redoReason}
                    onChange={(e) => setRedoReason(e.target.value)}
                    placeholder="Explain why the student should redo this assignment..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-700 border border-amber-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
                  />
                  <Button
                    variant="secondary"
                    className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-600/10"
                    onClick={requestRedo}
                    loading={requestingRedo}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Redo
                  </Button>
                </div>
              </details>

              <div className="flex gap-3 pt-2 border-t border-slate-700">
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
