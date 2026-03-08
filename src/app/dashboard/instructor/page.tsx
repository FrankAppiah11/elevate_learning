"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Users,
  FileCheck,
  TrendingUp,
  Bell,
  Eye,
  Hash,
  Copy,
  BookOpen,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ActivityItem {
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

interface InstructorClass {
  id: string;
  title: string;
  class_code: string;
  enrollments?: { count: number }[];
}

export default function InstructorDashboard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [classes, setClasses] = useState<InstructorClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [classRes, actRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/instructor/activities"),
        ]);
        if (classRes.ok) setClasses(await classRes.json());
        if (actRes.ok) setActivities(await actRes.json());
      } catch {}
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredActivities = activities.filter((a) => {
    if (activeTab === "pending") return a.status === "submitted";
    if (activeTab === "completed")
      return a.status === "graded" || a.status === "reviewed";
    return true;
  });

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.enrollments?.[0]?.count ?? 0),
    0
  );

  const pendingCount = activities.filter((a) => a.status === "submitted").length;
  const scoredActivities = activities.filter((a) => a.ai_score !== undefined);
  const avgScore =
    scoredActivities.length > 0
      ? Math.round(
          scoredActivities.reduce((s, a) => s + (a.ai_score || 0), 0) /
            scoredActivities.length
        )
      : 0;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <AppShell role="instructor" title="">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Activity Monitor
            <Bell className="w-5 h-5 text-slate-400" />
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Students</p>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">My Classes</p>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{classes.length}</p>
          </Card>
          <Card variant="highlight" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pending Review</p>
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Avg. AI Score</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgScore > 0 ? `${avgScore}%` : "—"}</p>
          </Card>
        </div>

        {/* Class Codes Quick View */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Class Codes</h2>
            <Link href="/dashboard/instructor/classes" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Manage Classes
            </Link>
          </div>
          {classes.length === 0 ? (
            <Card className="p-6 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-3">Create your first class to get a shareable code for students.</p>
              <Link href="/dashboard/instructor/classes">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Create a Class
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.slice(0, 6).map((cls) => (
                <Card key={cls.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white truncate flex-1">{cls.title}</h3>
                    <Badge variant="info" size="sm">
                      {cls.enrollments?.[0]?.count ?? 0} students
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2">
                    <span className="font-mono text-lg font-bold text-indigo-400 tracking-wider">
                      {cls.class_code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cls.class_code);
                        toast.success(`Code ${cls.class_code} copied!`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activities</h2>

          <div className="flex gap-2 mb-4">
            {(["all", "pending", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800 border border-transparent"
                }`}
              >
                {tab === "all" ? "All" : tab === "pending" ? "Pending Review" : "Completed"}
              </button>
            ))}
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
          ) : filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                {activeTab === "all"
                  ? "No student submissions yet. Once students submit work, it will appear here."
                  : `No ${activeTab === "pending" ? "pending" : "completed"} submissions.`}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="p-4 hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {activity.student_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-white">{activity.student_name}</h3>
                        <Badge
                          variant={activity.status === "submitted" ? "warning" : "success"}
                          size="sm"
                        >
                          {activity.status === "submitted" ? "Pending Review" : activity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{activity.course}</p>
                      <p className="text-sm text-slate-300 mt-1">
                        Assignment: {activity.assignment_title}
                      </p>
                      {activity.ai_score !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-slate-400">AI Score:</p>
                          <Badge
                            variant={
                              activity.ai_score >= 80
                                ? "success"
                                : activity.ai_score >= 60
                                ? "warning"
                                : "danger"
                            }
                          >
                            {Math.round(activity.ai_score)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-xs text-slate-500">{timeAgo(activity.submitted_at)}</p>
                      <Link href={`/assignments/${activity.assignment_id}/feedback`}>
                        <Button size="sm" variant={activity.status === "submitted" ? "primary" : "ghost"}>
                          <Eye className="w-3.5 h-3.5" />
                          {activity.status === "submitted" ? "Review" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
