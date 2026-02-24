"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, FolderOpen, Bot, User, LayoutDashboard, Activity, Users, GraduationCap, Settings } from "lucide-react";

interface MobileNavProps {
  role: "student" | "instructor";
}

const studentTabs = [
  { href: "/dashboard/student", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: FolderOpen },
  { href: "/assignments/new", label: "Upload", icon: BookOpen },
  { href: "/ai-tutors", label: "AI Tutor", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

const instructorTabs = [
  { href: "/dashboard/instructor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/instructor/activities", label: "Activities", icon: Activity },
  { href: "/dashboard/instructor/students", label: "Students", icon: Users },
  { href: "/dashboard/instructor/grading", label: "Grading", icon: GraduationCap },
  { href: "/dashboard/instructor/settings", label: "Settings", icon: Settings },
];

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const tabs = role === "student" ? studentTabs : instructorTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors min-w-[60px]",
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
