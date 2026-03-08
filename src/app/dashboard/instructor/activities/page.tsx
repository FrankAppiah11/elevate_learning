"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Clock,
  MessageSquare,
  RotateCcw,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

interface SessionData {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_name: string;
  student_email: string;
  tutor_id: string;
  duration_seconds: number;
  total_messages: number;
  go_backs: number;
  status: string;
  started_at: string;
  course: string;
}

const TUTOR_NAMES: Record<string, string> = {
  "socratic-sam": "Socratic Sam",
  "logical-leah": "Logical Leah",
  "curious-clara": "Curious Clara",
};

export default function ActivitiesPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/instructor/sessions");
        if (res.ok) setSessions(await res.json());
      } catch {}
      setLoading(false);
    }
    fetchSessions();
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <AppShell role="instructor" title="Student Activities">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
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
        ) : sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              No tutoring sessions yet. Once students start working with AI tutors,
              their sessions will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id} className="p-5 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {session.student_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {session.student_name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {session.assignment_title}
                        {session.course ? ` · ${session.course}` : ""}
                      </p>
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
                    <p className="text-sm text-slate-300 font-medium">
                      {TUTOR_NAMES[session.tutor_id] || session.tutor_id}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      {formatDuration(session.duration_seconds)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      Messages
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      {session.total_messages}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                      <RotateCcw className="w-3 h-3" />
                      Go-backs
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      {session.go_backs}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-slate-500">{timeAgo(session.started_at)}</p>
                  <Link href={`/assignments/${session.assignment_id}/feedback`}>
                    <Button variant="ghost" size="sm">
                      View Transcript
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
