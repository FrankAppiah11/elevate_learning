"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  Plus,
  BookOpen,
  User,
  Hash,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface EnrolledClass {
  id: string;
  title: string;
  description: string | null;
  class_code: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinedClass, setJoinedClass] = useState<{
    title: string;
    instructor_name: string;
  } | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) return;
    setJoining(true);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setJoinedClass({
          title: data.class.title,
          instructor_name: data.class.instructor_name,
        });
        setCode("");
        fetchClasses();
      } else {
        toast.error(data.error || "Failed to join class");
      }
    } catch {
      toast.error("Failed to join class");
    } finally {
      setJoining(false);
    }
  }

  function closeJoinModal() {
    setShowJoin(false);
    setJoinedClass(null);
    setCode("");
  }

  return (
    <AppShell role="student" title="My Classes">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Classes</h1>
            <p className="text-sm text-slate-400 mt-1">
              Join classes using codes from your instructor
            </p>
          </div>
          <Button onClick={() => setShowJoin(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Join a Class
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-700 rounded w-3/4" />
              </Card>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No classes yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Ask your instructor for a class code to get started. Once you
              join, you&apos;ll see your classes here.
            </p>
            <Button onClick={() => setShowJoin(true)}>
              <Hash className="w-4 h-4" />
              Enter Class Code
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {cls.title}
                    </h3>
                    {cls.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {cls.description}
                      </p>
                    )}
                  </div>
                </div>

                {cls.profiles && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <User className="w-3.5 h-3.5" />
                    <span>Instructor: {cls.profiles.full_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">
                    <Hash className="w-3 h-3" />
                    {cls.class_code}
                  </Badge>
                  <Badge variant="success" size="sm">
                    Enrolled
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showJoin} onClose={closeJoinModal} title="">
          {joinedClass ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Successfully Joined!
              </h3>
              <p className="text-slate-400 mb-1">
                You&apos;ve been enrolled in
              </p>
              <p className="text-lg font-semibold text-indigo-400 mb-1">
                {joinedClass.title}
              </p>
              <p className="text-sm text-slate-500">
                by {joinedClass.instructor_name}
              </p>
              <Button className="mt-6" onClick={closeJoinModal}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Join a Class
                </h3>
                <p className="text-sm text-slate-400">
                  Enter the code your instructor shared with you
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter class code"
                  maxLength={12}
                  className="w-full px-4 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>

              <Button
                onClick={handleJoin}
                loading={joining}
                disabled={!code.trim()}
                className="w-full"
                size="lg"
              >
                Join Class
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
