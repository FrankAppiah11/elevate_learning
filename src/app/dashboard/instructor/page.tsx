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
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface RecentActivity {
  id: string;
  student_name: string;
  student_avatar?: string;
  assignment_title: string;
  assignment_id: string;
  status: string;
  ai_score?: number;
  submitted_at: string;
  course?: string;
}

export default function InstructorDashboard() {
  const { user } = useUser();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

  const sampleActivities: RecentActivity[] = [
    {
      id: "1",
      student_name: "Marcus Chen",
      assignment_title: "Protein Synthesis Analysis",
      assignment_id: "a1",
      status: "pending_review",
      ai_score: 92,
      submitted_at: "2h ago",
      course: "Molecular Biology 101",
    },
    {
      id: "2",
      student_name: "Elena Rodriguez",
      assignment_title: "Quiz: Taylor Series Expansion",
      assignment_id: "a2",
      status: "completed",
      ai_score: 78,
      submitted_at: "5h ago",
      course: "Calculus II",
    },
    {
      id: "3",
      student_name: "Jordan Smith",
      assignment_title: "Introduction to Linear Algebra",
      assignment_id: "a3",
      status: "pending_review",
      ai_score: undefined,
      submitted_at: "1d ago",
      course: "Mathematics 201",
    },
  ];

  const filteredActivities = sampleActivities.filter((a) => {
    if (activeTab === "pending") return a.status === "pending_review";
    if (activeTab === "completed") return a.status === "completed";
    return true;
  });

  const stats = {
    totalStudents: 124,
    studentsChange: -7,
    pendingReview: 18,
    pendingChange: 3,
    avgAiScore: 84,
    avgDuration: "Past 7 days",
  };

  return (
    <AppShell role="instructor" title="">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Activity Monitor
              <Bell className="w-5 h-5 text-slate-400" />
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Students</p>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
              <span className="text-xs text-red-400">{stats.studentsChange}</span>
            </div>
          </Card>

          <Card variant="highlight" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pending Review</p>
              <FileCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{stats.pendingReview}</p>
              <span className="text-xs text-amber-400">+{stats.pendingChange}</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Avg. AI Tutoring Score</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgAiScore}%</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Period</p>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-white">{stats.avgDuration}</p>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activities</h2>

          {/* Tabs */}
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

          {/* Activity List */}
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
                        variant={activity.status === "pending_review" ? "warning" : "success"}
                        size="sm"
                      >
                        {activity.status === "pending_review" ? "Pending Review" : "Completed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {activity.course}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      Assignment: {activity.assignment_title}
                    </p>
                    {activity.ai_score !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-slate-400">AI Preliminary Score:</p>
                        <Badge variant={activity.ai_score >= 80 ? "success" : activity.ai_score >= 60 ? "warning" : "danger"}>
                          {activity.ai_score}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-slate-500">{activity.submitted_at}</p>
                    {activity.status === "pending_review" && (
                      <Link href={`/assignments/${activity.assignment_id}/feedback`}>
                        <Button size="sm" variant="primary">
                          <Eye className="w-3.5 h-3.5" />
                          Review Now
                        </Button>
                      </Link>
                    )}
                    {activity.status === "completed" && (
                      <Link href={`/assignments/${activity.assignment_id}/feedback`}>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
