"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Activity,
  Clock,
  MessageSquare,
  RotateCcw,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import Link from "next/link";

interface StudentSession {
  id: string;
  student_name: string;
  assignment_title: string;
  assignment_id: string;
  tutor_used: string;
  duration: string;
  messages: number;
  go_backs: number;
  status: string;
  timestamp: string;
}

export default function ActivitiesPage() {
  const [filter, setFilter] = useState("all");

  const sessions: StudentSession[] = [
    {
      id: "1",
      student_name: "Marcus Chen",
      assignment_title: "Protein Synthesis Analysis",
      assignment_id: "a1",
      tutor_used: "Socratic Sam",
      duration: "45m 12s",
      messages: 34,
      go_backs: 3,
      status: "completed",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      student_name: "Elena Rodriguez",
      assignment_title: "Taylor Series Expansion",
      assignment_id: "a2",
      tutor_used: "Logical Leah",
      duration: "32m 45s",
      messages: 28,
      go_backs: 1,
      status: "completed",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      student_name: "Jordan Smith",
      assignment_title: "Linear Algebra Intro",
      assignment_id: "a3",
      tutor_used: "Curious Clara",
      duration: "18m 30s",
      messages: 15,
      go_backs: 0,
      status: "active",
      timestamp: "Just now",
    },
  ];

  return (
    <AppShell role="instructor" title="Student Activities">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
          <p className="text-sm text-slate-400">{sessions.length} sessions</p>
        </div>

        {/* Sessions */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="p-5 hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {session.student_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{session.student_name}</h3>
                    <p className="text-xs text-slate-400">{session.assignment_title}</p>
                  </div>
                </div>
                <Badge
                  variant={session.status === "active" ? "success" : "default"}
                  size="sm"
                >
                  {session.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tutor</p>
                  <p className="text-sm text-slate-300 font-medium">{session.tutor_used}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <Clock className="w-3 h-3" />
                    Duration
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{session.duration}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <MessageSquare className="w-3 h-3" />
                    Messages
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{session.messages}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <RotateCcw className="w-3 h-3" />
                    Go-backs
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{session.go_backs}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Link href={`/assignments/${session.assignment_id}/feedback`}>
                  <Button variant="ghost" size="sm">
                    View Full Transcript
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
