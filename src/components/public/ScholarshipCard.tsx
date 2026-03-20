"use client";

import React from "react";
import Link from "next/link";
import { Calendar, DollarSign, ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";

interface ScholarshipCardProps {
  id: string;
  name: string;
  source: string;
  amount?: string;
  deadline: string | Date;
  isSaved?: boolean;
  studentId?: string;
  coversTuition?: boolean;
  coversStipend?: boolean;
  className?: string;
}

export function ScholarshipCard({
  id,
  name,
  source,
  amount,
  deadline,
  isSaved = false,
  studentId,
  coversTuition = true,
  coversStipend = false,
  className,
}: ScholarshipCardProps) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const isExpired = deadlineDate < now;
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={cn(
        "ns-card bg-card p-6 flex flex-col gap-5",
        isExpired && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <SaveButton
          variant="icon"
          itemId={id}
          itemType="scholarship"
          initialIsSaved={isSaved}
          studentId={studentId}
          className="text-muted-foreground/40 hover:text-primary"
        />
      </div>

      {/* Info */}
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
          {name}
        </h3>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {source}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ns-card-inner p-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Amount</p>
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm">{amount || "TBA"}</span>
          </div>
        </div>
        <div className="ns-card-inner p-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Deadline</p>
          <div
            className={cn(
              "flex items-center gap-1.5 font-bold text-sm",
              isExpired
                ? "text-destructive"
                : daysLeft <= 30
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
            )}
          >
            <Calendar className="w-4 h-4" />
            {isExpired
              ? "Closed"
              : daysLeft <= 30
              ? `${daysLeft}d left`
              : deadlineDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {coversTuition && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Full Tuition
          </span>
        )}
        {coversStipend && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3" /> Stipend
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Clock className="w-3.5 h-3.5" />
          {isExpired ? "Expired" : `Open until ${deadlineDate.toLocaleDateString()}`}
        </span>
        <Link
          href={`/scholarships/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Apply <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
