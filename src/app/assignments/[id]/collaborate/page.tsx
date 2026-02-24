"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Send,
  Save,
  Clock,
  MoreVertical,
  FileText,
  Globe,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { AI_TUTORS } from "@/lib/ai-tutors";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";

interface Message {
  id: string;
  role: "student" | "tutor";
  content: string;
  interaction_type: string;
  timestamp: string;
}

interface AssignmentData {
  id: string;
  title: string;
  description?: string;
  upload_type: string;
  file_url?: string;
  text_content?: string;
  web_url?: string;
  status: string;
}

export default function CollaboratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialTutor = searchParams.get("tutor") || "socratic-sam";

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState(initialTutor);
  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAssignment, setShowAssignment] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tutor = AI_TUTORS.find((t) => t.id === selectedTutor) || AI_TUTORS[0];

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchAssignment() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);

        if (data.status === "draft") {
          await fetch(`/api/assignments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          });
        }

        addWelcomeMessage();
      }
    } catch (err) {
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  }

  function addWelcomeMessage() {
    const welcomeMsg: Message = {
      id: "welcome",
      role: "tutor",
      content: `Welcome! I've reviewed the assignment. Instead of jumping to the formula, let's look at the problem step by step. If you were to differentiate this, what rule would you typically use?`,
      interaction_type: "clarification",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "student",
      content: input.trim(),
      interaction_type: "question",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role === "student" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor_id: selectedTutor,
          messages: allMessages,
          assignment_context: assignment
            ? `Title: ${assignment.title}\nDescription: ${assignment.description || ""}\nContent: ${assignment.text_content || "See uploaded file"}`
            : "",
          session_id: sessionId,
          assignment_id: id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tutorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "tutor",
          content: data.content,
          interaction_type: data.interaction_type,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tutorMessage]);
      } else {
        toast.error("Failed to get AI response");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await fetch(`/api/assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      toast.success("Draft saved!");
    } catch (err) {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const interactionsPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
        interaction_type: m.interaction_type,
        timestamp: m.timestamp,
      }));

      const submitRes = await fetch(`/api/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interactions: interactionsPayload,
          duration_seconds: duration,
          tutor_id: selectedTutor,
        }),
      });

      if (!submitRes.ok) throw new Error("Submission failed");

      toast.success("Work submitted! Notifying instructor...");

      const gradeRes = await fetch("/api/ai/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_id: id }),
      });

      if (gradeRes.ok) {
        await fetch("/api/ai/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignment_id: id }),
        });
        toast.success("AI grading complete! Redirecting to feedback...");
      }

      setTimeout(() => {
        window.location.href = `/assignments/${id}/feedback`;
      }, 1500);
    } catch (err) {
      toast.error("Failed to submit work");
    } finally {
      setSaving(false);
    }
  }

  function handleGoBack() {
    if (messages.length <= 1) return;
    const goBackMsg: Message = {
      id: Date.now().toString(),
      role: "student",
      content: "Let me go back to the previous concept. Can you explain it differently?",
      interaction_type: "go_back",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, goBackMsg]);
    setInput("");

    setTimeout(() => {
      const autoInput = "Let me go back to the previous concept. Can you explain it differently?";
      sendMessageDirect(autoInput, [...messages, goBackMsg]);
    }, 100);
  }

  async function sendMessageDirect(content: string, currentMessages: Message[]) {
    setSending(true);
    try {
      const allMessages = currentMessages.map((m) => ({
        role: m.role === "student" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor_id: selectedTutor,
          messages: allMessages,
          assignment_context: assignment
            ? `Title: ${assignment.title}\nContent: ${assignment.text_content || "See uploaded file"}`
            : "",
          session_id: sessionId,
          assignment_id: id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tutorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "tutor",
          content: data.content,
          interaction_type: data.interaction_type,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tutorMessage]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student">
              <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white">AI Collaboration</h1>
                <Badge variant="success" size="sm">Session Active</Badge>
              </div>
              <p className="text-xs text-slate-400">{assignment?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(duration)}
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Assignment Panel */}
        {showAssignment && (
          <div className="hidden lg:flex w-96 flex-col border-r border-slate-800 bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Assignment
              </h3>
              <button
                onClick={() => setShowAssignment(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {assignment?.upload_type === "text" && assignment.text_content && (
                <div className="prose prose-invert prose-sm">
                  <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {assignment.text_content}
                  </p>
                </div>
              )}
              {assignment?.file_url && (
                <div>
                  {assignment.upload_type === "screenshot" ? (
                    <img
                      src={assignment.file_url}
                      alt="Assignment"
                      className="w-full rounded-lg border border-slate-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <FileText className="w-16 h-16 text-slate-600 mb-3" />
                      <p className="text-sm text-slate-400 mb-3">Document uploaded</p>
                      <a
                        href={assignment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        Open document
                      </a>
                    </div>
                  )}
                </div>
              )}
              {assignment?.web_url && (
                <div className="flex flex-col items-center py-8">
                  <Globe className="w-16 h-16 text-slate-600 mb-3" />
                  <a
                    href={assignment.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    Open web link
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Tutor info bar */}
          <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: tutor.avatar_color + "30", color: tutor.avatar_color }}
              >
                {tutor.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-white">{tutor.name}</span>
              <Badge variant="purple" size="sm">{tutor.style}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {!showAssignment && (
                <button
                  onClick={() => setShowAssignment(true)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleGoBack}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                title="Go back to previous concept"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"} animate-slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "student"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-slate-800 text-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "tutor" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-medium" style={{ color: tutor.avatar_color }}>
                        {tutor.name}
                      </span>
                      {msg.interaction_type !== "answer" && (
                        <Badge variant="purple" size="sm">
                          {msg.interaction_type}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <div className="flex-1 flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-indigo-500 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask Socrates a question..."
                  className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2.5 mr-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between max-w-4xl mx-auto mt-3">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} loading={saving}>
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleSubmit} loading={saving}>
                Submit Work
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
