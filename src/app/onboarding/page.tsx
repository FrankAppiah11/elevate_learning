"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSession } from "@clerk/nextjs";
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type Role = "student" | "instructor";

const roles: {
  id: Role;
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
}[] = [
  {
    id: "student",
    title: "I'm a Student",
    subtitle: "Learn with AI-powered tutoring",
    icon: BookOpen,
    color: "text-indigo-400",
    bgColor: "bg-indigo-600/20",
    borderColor: "border-indigo-500/50",
    features: [
      "Upload assignments in any format",
      "Collaborate with AI tutors",
      "Get instant feedback and grading",
      "Track your learning progress",
    ],
  },
  {
    id: "instructor",
    title: "I'm an Instructor",
    subtitle: "Monitor and guide your students",
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
    features: [
      "Create classes with unique codes",
      "Monitor student AI interactions",
      "Review AI-generated grades",
      "Provide final grades and feedback",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { session } = useSession();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const firstName = user?.firstName || "there";

  async function handleContinue() {
    if (!selectedRole) return;
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (res.ok) {
        // Reload the session so middleware sees updated metadata
        await session?.reload();
        router.push(data.redirect);
      }
    } catch {
      console.error("Onboarding failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Welcome, {firstName}!
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            How will you be using Elevate? Choose your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative text-left rounded-2xl p-6 transition-all duration-300 border-2 ${
                  isSelected
                    ? `${role.borderColor} ${role.bgColor} shadow-lg`
                    : "border-slate-700/50 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800/80"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className={`w-6 h-6 ${role.color}`} />
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-xl ${role.bgColor} flex items-center justify-center mb-4`}
                >
                  <role.icon className={`w-7 h-7 ${role.color}`} />
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {role.title}
                </h2>
                <p className="text-sm text-slate-400 mb-4">{role.subtitle}</p>

                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 flex-shrink-0 ${role.color}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
              selectedRole
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Setting up your account...
              </>
            ) : (
              <>
                Continue as{" "}
                {selectedRole
                  ? selectedRole === "student"
                    ? "Student"
                    : "Instructor"
                  : "..."}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          You can always update your role later from your profile settings.
        </p>
      </div>
    </div>
  );
}
