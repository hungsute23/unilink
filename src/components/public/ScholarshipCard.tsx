"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap, Building2, Landmark, ArrowRight,
  CheckCircle2, Clock, CalendarDays, Banknote,
} from "lucide-react";
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
  coversDorm?: boolean;
  duration?: string;
  className?: string;
}

const SOURCE_META: Record<string, { label: string; icon: React.ElementType; bar: string; badge: string }> = {
  government:   { label: "Government",    icon: Landmark,    bar: "from-emerald-500 to-teal-500",    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" },
  school_based: { label: "University",    icon: GraduationCap, bar: "from-blue-500 to-indigo-500",   badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" },
  private:      { label: "Private Fund",  icon: Building2,   bar: "from-violet-500 to-purple-500",   badge: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400" },
};

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
  coversDorm = false,
  duration,
  className,
}: ScholarshipCardProps) {
  const meta = SOURCE_META[source] ?? SOURCE_META.government;
  const Icon = meta.icon;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;
  const isUrgent = !isExpired && daysLeft <= 30;

  const deadlineLabel = isExpired
    ? "Closed"
    : isUrgent
    ? `${daysLeft}d left`
    : deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={cn("ns-card flex flex-col overflow-hidden", isExpired && "grayscale opacity-60", className)}>

      {/* Colour bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.bar}`} />

      <div className="p-6 flex flex-col gap-4 flex-1">

        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.badge}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
          <SaveButton
            variant="icon"
            itemId={id}
            itemType="scholarship"
            initialIsSaved={isSaved}
            studentId={studentId}
            className="text-muted-foreground/40 hover:text-primary shrink-0"
          />
        </div>

        {/* Title */}
        <Link href={`/scholarships/${id}`}>
          <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Amount */}
        {amount && (
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-2xl px-4 py-2.5">
            <Banknote className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground line-clamp-1">{amount}</span>
          </div>
        )}

        {/* Coverage pills */}
        <div className="flex flex-wrap gap-1.5">
          {coversTuition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Tuition
            </span>
          )}
          {coversStipend && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:text-blue-400">
              <CheckCircle2 className="w-3 h-3" /> Stipend
            </span>
          )}
          {coversDorm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-400">
              <CheckCircle2 className="w-3 h-3" /> Dorm
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <span className={cn(
            "flex items-center gap-1.5 text-xs font-semibold",
            isExpired ? "text-destructive" : isUrgent ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          )}>
            {isUrgent ? <Clock className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
            {deadlineLabel}
          </span>
          <Link
            href={`/scholarships/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline transition-colors"
          >
            View details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
