"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import ScoreCircle from "@/components/ui/ScoreCircle";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  FileText,
  Star,
  Hash,
  User,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface DashboardAssignment {
  id: string;
  title: string;
  status: string;
  folder_label: string;
  created_at: string;
  module_title?: string;
  grade?: string;
  ai_score: number | null;
  letter_grade: string | null;
  problem_solving_score: number | null;
  ai_competency_score: number | null;
  correctness_score: number | null;
  instructor_grade: string | null;
  instructor_notes: string | null;
}

interface EnrolledClass {
  id: string;
  title: string;
  description: string | null;
  class_code: string;
  profiles?: { full_name: string };
}

const isReviewable = (status: string) =>
  ["submitted", "graded", "reviewed"].includes(status);

export default function StudentDashboard() {
  const { user } = useUser();
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<DashboardAssignment | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assignRes, classRes] = await Promise.all([
          fetch("/api/assignments"),
          fetch("/api/classes"),
        ]);
        if (assignRes.ok) setAssignments(await assignRes.json());
        if (classRes.ok) setEnrolledClasses(await classRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completedCount = assignments.filter(
    (a) => a.status === "graded" || a.status === "reviewed"
  ).length;
  const inProgressCount = assignments.filter(
    (a) => a.status === "in_progress" || a.status === "submitted"
  ).length;

  const gradedAssignments = assignments.filter((a) => a.ai_score !== null);
  const avgGrade =
    gradedAssignments.length > 0
      ? Math.round(
          gradedAssignments.reduce((sum, a) => sum + (a.ai_score ?? 0), 0) /
            gradedAssignments.length
        )
      : null;

  const weeklyGoal = { current: 7, target: 10 };
  const firstName = user?.firstName || "Student";

  function handleAssignmentClick(assignment: DashboardAssignment) {
    if (isReviewable(assignment.status)) {
      setSelectedAssignment(assignment);
    }
  }

  return (
    <AppShell role="student" title="">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white">{firstName}</h1>
          </div>
          <Link href="/assignments/new" className="w-full sm:w-auto">
            <Button size="lg" className="shadow-lg shadow-indigo-500/25 w-full sm:w-auto">
              <Plus className="w-5 h-5" />
              New Assignment Upload
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">{completedCount}</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">{inProgressCount}</p>
                <p className="text-[10px] sm:text-xs text-slate-400">In Progress</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {avgGrade !== null ? `${avgGrade}%` : "—"}
                  </p>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400">Avg. Grade</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {assignments.length}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400">Total Assignments</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Goal */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Weekly Study Goal</h3>
            <Badge variant="success" size="sm">
              {Math.round((weeklyGoal.current / weeklyGoal.target) * 100)}% Done
            </Badge>
          </div>
          <ProgressBar
            value={weeklyGoal.current}
            max={weeklyGoal.target}
            color="indigo"
            size="md"
          />
          <p className="text-xs text-slate-400 mt-2">
            {weeklyGoal.target - weeklyGoal.current} assignments to reach your milestone!
          </p>
        </Card>

        {/* Enrolled Classes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Classes</h2>
            <Link href="/dashboard/student/classes" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              {enrolledClasses.length > 0 ? "See all" : "Join a class"}
            </Link>
          </div>
          {enrolledClasses.length === 0 ? (
            <Card className="p-6 text-center">
              <Hash className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-3">
                You haven&apos;t joined any classes yet. Ask your instructor for a class code.
              </p>
              <Link href="/dashboard/student/classes">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Join a Class
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enrolledClasses.slice(0, 4).map((cls) => (
                <Card key={cls.id} className="p-4 hover:border-slate-600 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{cls.title}</h3>
                        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      </div>
                      {cls.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{cls.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="info" size="sm">
                          <Hash className="w-3 h-3" />
                          {cls.class_code}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assignments */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Assignments</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-5 bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No assignments yet. Upload your first assignment to get started!</p>
              <Link href="/assignments/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Upload Assignment
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => {
                const reviewable = isReviewable(assignment.status);
                const inner = (
                  <Card
                    className="p-4 hover:border-slate-600 transition-all cursor-pointer group"
                    onClick={reviewable ? () => handleAssignmentClick(assignment) : undefined}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">{assignment.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {assignment.ai_score !== null && (
                              <Badge variant="default" size="sm" className="bg-indigo-600/30 text-indigo-300 border-indigo-500/30">
                                AI: {assignment.ai_score}%
                              </Badge>
                            )}
                            {assignment.instructor_grade && (
                              <Badge variant="success" size="sm">
                                Final: {assignment.instructor_grade}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                assignment.status === "graded" || assignment.status === "reviewed"
                                  ? "success"
                                  : assignment.status === "in_progress"
                                  ? "warning"
                                  : assignment.status === "submitted"
                                  ? "info"
                                  : "default"
                              }
                            >
                              {assignment.status === "submitted"
                                ? "in review"
                                : assignment.status.replace("_", " ")}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{assignment.folder_label}</p>
                      </div>
                    </div>
                  </Card>
                );

                if (reviewable) {
                  return <div key={assignment.id}>{inner}</div>;
                }
                return (
                  <Link key={assignment.id} href={`/assignments/${assignment.id}/collaborate`}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scorecard Modal */}
      <Modal
        open={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title="Assignment Scorecard"
        className="max-w-xl"
      >
        {selectedAssignment && (
          <div className="space-y-5">
            {/* Assignment Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60">
              <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{selectedAssignment.title}</h4>
                <p className="text-xs text-slate-400">{selectedAssignment.folder_label}</p>
              </div>
              <Badge
                variant={
                  selectedAssignment.status === "graded" || selectedAssignment.status === "reviewed"
                    ? "success"
                    : "info"
                }
                className="ml-auto flex-shrink-0"
              >
                {selectedAssignment.status === "submitted"
                  ? "in review"
                  : selectedAssignment.status.replace("_", " ")}
              </Badge>
            </div>

            {/* AI Grade Section */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                AI Grade
              </h4>
              {selectedAssignment.ai_score !== null ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center justify-center gap-5 p-4 rounded-xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20">
                    <ScoreCircle
                      score={selectedAssignment.ai_score}
                      size="md"
                      grade={selectedAssignment.letter_grade || undefined}
                      label="Overall"
                    />
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedAssignment.ai_score}%</p>
                      <p className="text-sm text-slate-400">Weighted Total</p>
                      {selectedAssignment.letter_grade && (
                        <Badge variant="info" size="md" className="mt-1">
                          {selectedAssignment.letter_grade}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-slate-900/60">
                      <ScoreCircle score={selectedAssignment.problem_solving_score ?? 0} size="sm" />
                      <p className="text-[10px] text-slate-400 mt-1.5">Problem Solving</p>
                      <p className="text-xs font-semibold text-white">
                        {selectedAssignment.problem_solving_score ?? "—"}%
                      </p>
                      <p className="text-[10px] text-slate-500">60% weight</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-900/60">
                      <ScoreCircle score={selectedAssignment.ai_competency_score ?? 0} size="sm" />
                      <p className="text-[10px] text-slate-400 mt-1.5">AI Competency</p>
                      <p className="text-xs font-semibold text-white">
                        {selectedAssignment.ai_competency_score ?? "—"}%
                      </p>
                      <p className="text-[10px] text-slate-500">30% weight</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-900/60">
                      <ScoreCircle score={selectedAssignment.correctness_score ?? 0} size="sm" />
                      <p className="text-[10px] text-slate-400 mt-1.5">Correctness</p>
                      <p className="text-xs font-semibold text-white">
                        {selectedAssignment.correctness_score ?? "—"}%
                      </p>
                      <p className="text-[10px] text-slate-500">10% weight</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <p className="text-sm text-slate-400">AI grading is processing. Check back shortly.</p>
                </div>
              )}
            </div>

            {/* Instructor Grade Section */}
            <div>
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Instructor&apos;s Final Grade
              </h4>
              {selectedAssignment.instructor_grade ? (
                <div className="p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">{selectedAssignment.instructor_grade}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-300">Grade Received</p>
                      {selectedAssignment.instructor_notes ? (
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {selectedAssignment.instructor_notes}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">No additional notes provided.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-dashed border-amber-500/30">
                  <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-300">Pending Instructor Review</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your instructor hasn&apos;t graded this yet. You&apos;ll be notified when the final grade is available.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link href={`/assignments/${selectedAssignment.id}/feedback`} className="flex-1">
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4" />
                  View Full Report
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setSelectedAssignment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
