"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Bot,
  FolderOpen,
  User,
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  GraduationCap,
} from "lucide-react";

interface SidebarProps {
  role: "student" | "instructor";
}

const studentLinks = [
  { href: "/dashboard/student", label: "Home", icon: Home },
  { href: "/assignments/new", label: "New Assignment", icon: BookOpen },
  { href: "/library", label: "Library", icon: FolderOpen },
  { href: "/ai-tutors", label: "AI Tutors", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

const instructorLinks = [
  { href: "/dashboard/instructor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/instructor/activities", label: "Activities", icon: Activity },
  { href: "/dashboard/instructor/students", label: "Students", icon: Users },
  { href: "/dashboard/instructor/grading", label: "Grading", icon: GraduationCap },
  { href: "/dashboard/instructor/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "student" ? studentLinks : instructorLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      <div className="p-6">
        <Link href={role === "student" ? "/dashboard/student" : "/dashboard/instructor"} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Elevate</h1>
            <p className="text-xs text-slate-400">Learning with AI</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-2 text-xs text-slate-500">
          {role === "student" ? "Student" : "Instructor"} Portal
        </div>
      </div>
    </aside>
  );
}
