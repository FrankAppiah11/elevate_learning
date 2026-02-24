"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <AppShell role="student" title="Profile">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Card className="p-2">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                navbar: "bg-slate-800/50 rounded-xl",
                navbarButton: "text-slate-300 hover:text-white",
                pageScrollBox: "p-4",
                formFieldInput: "bg-slate-800 border-slate-700 text-white",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
              },
            }}
          />
        </Card>
      </div>
    </AppShell>
  );
}
