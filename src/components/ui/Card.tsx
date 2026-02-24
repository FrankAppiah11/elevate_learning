"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "highlight";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          {
            "bg-slate-800/80 border border-slate-700/50": variant === "default",
            "bg-slate-800/40 backdrop-blur-xl border border-slate-700/30": variant === "glass",
            "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30":
              variant === "highlight",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
