"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Bell, FileCheck, MessageSquare, Star, Clock } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  related_assignment_id?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "submission": return FileCheck;
      case "grade": return Star;
      case "feedback": return MessageSquare;
      default: return Bell;
    }
  };

  const sampleNotifications: NotificationItem[] = notifications.length > 0 ? notifications : [
    {
      id: "1",
      title: "Assignment Submitted",
      message: "Your Calculus II assignment has been submitted for review.",
      type: "submission",
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      title: "Grade Available",
      message: "Your Protein Synthesis analysis has been graded. Check your feedback report.",
      type: "grade",
      related_assignment_id: "a1",
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <AppShell role="student" title="Notifications">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {sampleNotifications.map((notif) => {
          const Icon = getIcon(notif.type);
          return (
            <Card
              key={notif.id}
              className={`p-4 transition-all cursor-pointer hover:border-slate-600 ${
                !notif.is_read ? "border-l-2 border-l-indigo-500" : ""
              }`}
              onClick={() => markRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !notif.is_read ? "bg-indigo-600/20" : "bg-slate-700"
                }`}>
                  <Icon className={`w-5 h-5 ${!notif.is_read ? "text-indigo-400" : "text-slate-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${!notif.is_read ? "text-white" : "text-slate-300"}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && <Badge variant="info" size="sm">New</Badge>}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
