import Link from "next/link";
import { GraduationCap, Bot, BarChart3, Shield, ArrowRight, BookOpen, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">Elevate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Elevate Your
            <br />
            <span className="gradient-text">Learning Journey</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            An intelligent learning platform where AI tutors collaborate with students — 
            not to give answers, but to build understanding. Track progress, get 
            comprehensive feedback, and achieve mastery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Instructor Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive platform designed around how students actually learn best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: "AI Tutors That Guide",
              desc: "Three distinct tutoring styles — Socratic, Structured, and Exploratory. They provide examples and ask guiding questions, never giving away answers.",
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: BookOpen,
              title: "Flexible Upload",
              desc: "Upload assignments as screenshots, Word docs, PDFs, plain text, or web links. The platform renders them for seamless collaboration.",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: BarChart3,
              title: "AI-Powered Grading",
              desc: "60% problem-solving ability, 30% AI competency, 10% correctness. Grading that values the learning process, not just the final answer.",
              color: "from-emerald-500 to-teal-500",
            },
            {
              icon: Shield,
              title: "Built-in Guardrails",
              desc: "AI tutors never give direct answers. They're designed to support learning through guided discovery with diverse examples.",
              color: "from-amber-500 to-orange-500",
            },
            {
              icon: Users,
              title: "Instructor Dashboard",
              desc: "Real-time activity monitoring, student progress tracking, and the ability to review AI interactions and provide final grades.",
              color: "from-cyan-500 to-blue-500",
            },
            {
              icon: Zap,
              title: "LMS Integration",
              desc: "Seamlessly integrates with Canvas, Blackboard, Moodle, and other LMS platforms via LTI 1.3 protocol.",
              color: "from-rose-500 to-red-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grading breakdown */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        <div className="rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Grading That Values <span className="gradient-text">Process</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Our AI grading system evaluates how students think and learn, not just
                whether they got the right answer. This encourages deeper engagement with
                the material.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Problem Solving", pct: 60, color: "bg-indigo-500" },
                  { label: "AI Competency", pct: 30, color: "bg-purple-500" },
                  { label: "Correctness", pct: 10, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="text-slate-400">{item.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="20" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" strokeWidth="20" strokeDasharray="502.65" strokeDashoffset="201.06" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="502.65" strokeDashoffset="351.86" strokeLinecap="round" className="origin-center" style={{ transform: "rotate(216deg)", transformOrigin: "100px 100px" }} />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="502.65" strokeDashoffset="452.39" strokeLinecap="round" className="origin-center" style={{ transform: "rotate(324deg)", transformOrigin: "100px 100px" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">100%</span>
                  <span className="text-sm text-slate-400">Total Weight</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">Elevate</span>?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join students and instructors who are transforming education with AI-powered learning.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <GraduationCap className="w-4 h-4" />
            Elevate Learning with AI
          </div>
          <p className="text-slate-500 text-sm">LTI 1.3 compatible — Integrates with Canvas, Blackboard, Moodle</p>
        </div>
      </footer>
    </div>
  );
}
