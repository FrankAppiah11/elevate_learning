"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  FileText,
  Star,
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
}

interface DashboardModule {
  id: string;
  title: string;
  description: string;
  assignment_count: number;
}

export default function StudentDashboard() {
  const { user } = useUser();
  const [assignments, setAssignments] = useState<DashboardAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/assignments");
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
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
  const avgGrade = 94;
  const weeklyGoal = { current: 7, target: 10 };

  const firstName = user?.firstName || "Student";

  const sampleModules: DashboardModule[] = [
    { id: "1", title: "Advanced Mathematics", description: "Calculus & Linear Algebra", assignment_count: 4 },
    { id: "2", title: "World Literature", description: "The Modern Novel", assignment_count: 2 },
  ];

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
                  <p className="text-xl sm:text-2xl font-bold text-white">{avgGrade}%</p>
                  <span className="text-[10px] sm:text-xs text-emerald-400">Top 5%</span>
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

        {/* Current Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Current Modules</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              See all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sampleModules.map((mod) => (
              <Card key={mod.id} className="p-4 hover:border-slate-600 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{mod.title}</h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                    <div className="mt-2">
                      <Badge variant="info">{mod.assignment_count} Docs</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
              {assignments.slice(0, 5).map((assignment) => (
                <Link key={assignment.id} href={`/assignments/${assignment.id}/collaborate`}>
                  <Card className="p-4 hover:border-slate-600 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">{assignment.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant={
                                assignment.status === "graded"
                                  ? "success"
                                  : assignment.status === "in_progress"
                                  ? "warning"
                                  : assignment.status === "submitted"
                                  ? "info"
                                  : "default"
                              }
                            >
                              {assignment.status.replace("_", " ")}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{assignment.folder_label}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
