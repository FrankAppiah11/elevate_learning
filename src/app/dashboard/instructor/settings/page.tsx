"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Settings, Link2, Shield, Bell, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [lmsUrl, setLmsUrl] = useState("");
  const [lmsType, setLmsType] = useState("canvas");

  return (
    <AppShell role="instructor" title="Settings">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* LMS Integration */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-400" />
            LMS Integration
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Connect Elevate with your existing Learning Management System via LTI 1.3
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                LMS Platform
              </label>
              <select
                value={lmsType}
                onChange={(e) => setLmsType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="canvas">Canvas</option>
                <option value="blackboard">Blackboard</option>
                <option value="moodle">Moodle</option>
                <option value="d2l">D2L Brightspace</option>
                <option value="other">Other (LTI 1.3)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                LMS Instance URL
              </label>
              <input
                type="url"
                value={lmsUrl}
                onChange={(e) => setLmsUrl(e.target.value)}
                placeholder="https://your-institution.instructure.com"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-white mb-3">LTI 1.3 Configuration</h4>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Launch URL", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"}/api/lti/launch` },
                  { label: "Login URL", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"}/api/lti/login` },
                  { label: "Redirect URI", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"}/api/lti/callback` },
                  { label: "JWKS URL", value: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"}/api/lti/jwks` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-400">{item.label}:</span>
                    <code className="text-xs text-indigo-400 bg-slate-900 px-2 py-1 rounded">{item.value}</code>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => toast.success("LMS configuration saved!")}>
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Notification Preferences
          </h2>
          <div className="space-y-3">
            {[
              { label: "Student submissions", desc: "Notify when a student submits work", enabled: true },
              { label: "AI grading complete", desc: "Notify when AI grading is finished", enabled: true },
              { label: "Student questions", desc: "Notify when students ask for help", enabled: false },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{pref.label}</p>
                  <p className="text-xs text-slate-400">{pref.desc}</p>
                </div>
                <button
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    pref.enabled ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      pref.enabled ? "translate-x-5.5 left-[1px]" : "left-0.5"
                    }`}
                    style={{ left: pref.enabled ? "22px" : "2px" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Grading Scheme */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            AI Grading Scheme
          </h2>
          <div className="space-y-3">
            {[
              { label: "Problem Solving Abilities", weight: "60%", desc: "Based on student-AI interaction quality" },
              { label: "AI Competency", weight: "30%", desc: "Quality of questions and AI utilization" },
              { label: "Correctness", weight: "10%", desc: "Accuracy of final answers" },
            ].map((criterion) => (
              <div key={criterion.label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{criterion.label}</p>
                  <p className="text-xs text-slate-400">{criterion.desc}</p>
                </div>
                <Badge variant="info" size="md">{criterion.weight}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
