"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  role: "student" | "instructor";
  title?: string;
}

export default function AppShell({ children, role, title }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar title={title} />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
