"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Search, Users, TrendingUp, BookOpen, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  classes: string[];
  enrolled_at: string;
  assignments_total: number;
  assignments_completed: number;
  avg_score: number | null;
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/instructor/students");
        if (res.ok) setStudents(await res.json());
      } catch {}
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const classAvg =
    students.length > 0
      ? Math.round(
          students
            .filter((s) => s.avg_score !== null)
            .reduce((a, s) => a + (s.avg_score || 0), 0) /
            (students.filter((s) => s.avg_score !== null).length || 1)
        )
      : 0;

  const totalCompleted = students.reduce(
    (a, s) => a + s.assignments_completed,
    0
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
              {classAvg > 0 ? `${classAvg}%` : "—"}
            </p>
            <p className="text-xs text-slate-400">Class Average</p>
          </Card>
          <Card className="p-4 text-center">
            <BookOpen className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalCompleted}</p>
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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {students.length === 0
                ? "No students enrolled yet. Share your class code to get students."
                : "No students match your search."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((student) => (
              <Card key={student.id} className="p-5 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">{student.name}</h3>
                      {student.avg_score !== null && (
                        <Badge
                          variant={
                            student.avg_score >= 80
                              ? "success"
                              : student.avg_score >= 60
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {student.avg_score}% avg
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{student.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Classes: {student.classes.join(", ") || "None"}
                    </p>
                    {student.assignments_total > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">
                            Progress: {student.assignments_completed}/
                            {student.assignments_total}
                          </span>
                        </div>
                        <ProgressBar
                          value={student.assignments_completed}
                          max={student.assignments_total}
                          color={
                            (student.avg_score ?? 0) >= 80
                              ? "emerald"
                              : (student.avg_score ?? 0) >= 60
                              ? "amber"
                              : "red"
                          }
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">
                      {student.assignments_total} assignment
                      {student.assignments_total !== 1 ? "s" : ""}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-500 mt-4 ml-auto" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
