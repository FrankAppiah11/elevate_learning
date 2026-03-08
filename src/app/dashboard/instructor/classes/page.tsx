"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  Plus,
  Copy,
  CheckCircle2,
  Users,
  BookOpen,
  Hash,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  class_code: string;
  created_at: string;
  enrollments?: { count: number }[];
}

export default function InstructorClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });

      if (res.ok) {
        const newClass = await res.json();
        setClasses((prev) => [newClass, ...prev]);
        setShowCreate(false);
        setTitle("");
        setDescription("");
        toast.success(`Class created! Code: ${newClass.class_code}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create class");
      }
    } catch {
      toast.error("Failed to create class");
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Class code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const getStudentCount = (cls: ClassItem) =>
    cls.enrollments?.[0]?.count ?? 0;

  return (
    <AppShell role="instructor" title="My Classes">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Classes</h1>
            <p className="text-sm text-slate-400 mt-1">
              Create classes and share codes with your students
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create New Class
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-700 rounded w-3/4 mb-4" />
                <div className="h-10 bg-slate-700 rounded" />
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
              Create your first class to generate a unique code that students
              can use to join and submit their assignments.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create Your First Class
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <Card key={cls.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {cls.title}
                      </h3>
                      {cls.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cls.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-4 mb-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Class Code
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-mono font-bold text-white tracking-[0.2em]">
                      {cls.class_code}
                    </span>
                    <button
                      onClick={() => copyCode(cls.class_code)}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === cls.class_code ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>
                      {getStudentCount(cls)} student
                      {getStudentCount(cls) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Badge variant="info" size="sm">
                    {new Date(cls.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create a New Class"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Class / Course Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Biology"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the course..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
              />
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clipboard className="w-4 h-4 text-indigo-400" />
                A unique class code will be auto-generated that you can share
                with your students.
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                loading={creating}
                disabled={!title.trim()}
              >
                Create Class
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
