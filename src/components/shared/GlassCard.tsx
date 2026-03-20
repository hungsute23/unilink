"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export function GlassCard({ children, className, gradient, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
        gradient && "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-accent/10 before:opacity-0 group-hover:before:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
