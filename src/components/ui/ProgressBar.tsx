"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "indigo" | "emerald" | "amber" | "red" | "blue";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "indigo",
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn("w-full rounded-full bg-slate-700/50 overflow-hidden", {
          "h-1.5": size === "sm",
          "h-2.5": size === "md",
          "h-4": size === "lg",
        })}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", {
            "bg-gradient-to-r from-indigo-600 to-indigo-400": color === "indigo",
            "bg-gradient-to-r from-emerald-600 to-emerald-400": color === "emerald",
            "bg-gradient-to-r from-amber-600 to-amber-400": color === "amber",
            "bg-gradient-to-r from-red-600 to-red-400": color === "red",
            "bg-gradient-to-r from-blue-600 to-blue-400": color === "blue",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
