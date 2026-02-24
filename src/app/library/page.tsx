"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Folder, FileText, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

interface AssignmentFolder {
  id: string;
  title: string;
  folder_label: string;
  status: string;
  upload_type: string;
  created_at: string;
  has_grade: boolean;
  has_feedback: boolean;
}

export default function LibraryPage() {
  const [assignments, setAssignments] = useState<AssignmentFolder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch("/api/assignments");
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.folder_label.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByStatus = {
    graded: filtered.filter((a) => a.status === "graded" || a.status === "reviewed"),
    in_progress: filtered.filter((a) => a.status === "in_progress" || a.status === "submitted"),
    draft: filtered.filter((a) => a.status === "draft"),
  };

  return (
    <AppShell role="student" title="Library">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Search */}
        <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-indigo-500 transition-colors">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments and folders..."
            className="bg-transparent text-white placeholder-slate-500 outline-none w-full text-sm"
          />
        </div>

        {/* Sections */}
        {Object.entries(groupedByStatus).map(([status, items]) =>
          items.length > 0 ? (
            <div key={status}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {status === "graded" ? "Graded" : status === "in_progress" ? "In Progress" : "Drafts"}
                <span className="ml-2 text-slate-500">({items.length})</span>
              </h2>
              <div className="space-y-2">
                {items.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={
                      assignment.status === "graded" || assignment.status === "reviewed"
                        ? `/assignments/${assignment.id}/feedback`
                        : `/assignments/${assignment.id}/collaborate`
                    }
                  >
                    <Card className="p-4 hover:border-slate-600 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                          <Folder className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white">{assignment.title}</h3>
                          <p className="text-xs text-slate-400">{assignment.folder_label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              assignment.status === "graded" || assignment.status === "reviewed"
                                ? "success"
                                : assignment.status === "submitted"
                                ? "info"
                                : assignment.status === "in_progress"
                                ? "warning"
                                : "default"
                            }
                            size="sm"
                          >
                            {assignment.status.replace("_", " ")}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null
        )}

        {filtered.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {search ? "No assignments match your search" : "Your library is empty. Upload an assignment to get started!"}
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
