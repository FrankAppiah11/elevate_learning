"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useStore } from "@/store/useStore";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title }: TopBarProps) {
  const notifications = useStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-800 rounded-xl px-3 py-2 w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search assignments..."
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full"
            />
          </div>

          <Link
            href="/notifications"
            className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-medium">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
