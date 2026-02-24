"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { Search, Users, TrendingUp, BookOpen, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  avg_score: number;
  assignments_completed: number;
  assignments_total: number;
  last_active: string;
  trend: "up" | "down" | "stable";
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");

  const students: Student[] = [
    {
      id: "1",
      name: "Marcus Chen",
      email: "marcus@university.edu",
      avg_score: 92,
      assignments_completed: 8,
      assignments_total: 10,
      last_active: "2h ago",
      trend: "up",
    },
    {
      id: "2",
      name: "Elena Rodriguez",
      email: "elena@university.edu",
      avg_score: 78,
      assignments_completed: 6,
      assignments_total: 10,
      last_active: "5h ago",
      trend: "stable",
    },
    {
      id: "3",
      name: "Jordan Smith",
      email: "jordan@university.edu",
      avg_score: 65,
      assignments_completed: 4,
      assignments_total: 10,
      last_active: "1d ago",
      trend: "down",
    },
    {
      id: "4",
      name: "Aisha Patel",
      email: "aisha@university.edu",
      avg_score: 88,
      assignments_completed: 9,
      assignments_total: 10,
      last_active: "3h ago",
      trend: "up",
    },
  ];

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="instructor" title="Students">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Users className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{students.length}</p>
            <p className="text-xs text-slate-400">Total Students</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Math.round(students.reduce((acc, s) => acc + s.avg_score, 0) / students.length)}%
            </p>
            <p className="text-xs text-slate-400">Class Average</p>
          </Card>
          <Card className="p-4 text-center">
            <BookOpen className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {students.reduce((acc, s) => acc + s.assignments_completed, 0)}
            </p>
            <p className="text-xs text-slate-400">Assignments Done</p>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-indigo-500 transition-colors">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="bg-transparent text-white placeholder-slate-500 outline-none w-full text-sm"
          />
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filtered.map((student) => (
            <Card key={student.id} className="p-5 hover:border-slate-600 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white">{student.name}</h3>
                    <Badge
                      variant={student.trend === "up" ? "success" : student.trend === "down" ? "danger" : "default"}
                      size="sm"
                    >
                      {student.trend === "up" ? "Improving" : student.trend === "down" ? "Needs Help" : "Stable"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{student.email}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        Progress: {student.assignments_completed}/{student.assignments_total}
                      </span>
                      <span className="text-slate-300 font-medium">Avg: {student.avg_score}%</span>
                    </div>
                    <ProgressBar
                      value={student.assignments_completed}
                      max={student.assignments_total}
                      color={student.avg_score >= 80 ? "emerald" : student.avg_score >= 60 ? "amber" : "red"}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500">{student.last_active}</p>
                  <ChevronRight className="w-4 h-4 text-slate-500 mt-4 ml-auto" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
