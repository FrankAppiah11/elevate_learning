"use client";

import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  grade?: string;
  className?: string;
}

export default function ScoreCircle({ score, size = "md", label, grade, className }: ScoreCircleProps) {
  const radius = size === "sm" ? 30 : size === "md" ? 45 : 60;
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 5 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const getColor = () => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {grade ? (
            <span className={cn("font-bold", {
              "text-lg": size === "sm",
              "text-2xl": size === "md",
              "text-4xl": size === "lg",
            })} style={{ color: getColor() }}>
              {grade}
            </span>
          ) : (
            <span className={cn("font-bold text-white", {
              "text-sm": size === "sm",
              "text-xl": size === "md",
              "text-3xl": size === "lg",
            })}>
              {score}%
            </span>
          )}
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 mt-1 text-center">{label}</span>}
    </div>
  );
}
