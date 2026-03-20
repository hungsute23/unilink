"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  city?: string;
  hoursPerWeek?: number | string;
  isSaved?: boolean;
  studentId?: string;
  allowsStudentVisa?: boolean;
  chineseRequired?: string | boolean;
  className?: string;
}

export function JobCard({
  id,
  title,
  companyName,
  city,
  hoursPerWeek,
  isSaved = false,
  studentId,
  allowsStudentVisa = true,
  chineseRequired,
  className,
}: JobCardProps) {
  const noChineseNeeded =
    !chineseRequired || chineseRequired === "none" || chineseRequired === "None";

  return (
    <div className={cn("ns-card p-6 flex flex-col gap-5", className)}>
      {/* Header: icon left, title + company + save right */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0 space-y-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/jobs/${id}`}>
              <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
            <SaveButton
              variant="icon"
              itemId={id}
              itemType="job"
              initialIsSaved={isSaved}
              studentId={studentId}
              className="text-muted-foreground/40 hover:text-primary shrink-0 -mt-0.5"
            />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{companyName}</p>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        {city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            {city}
          </div>
        )}
        {hoursPerWeek && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            {hoursPerWeek} hrs / week
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {allowsStudentVisa && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Visa Friendly
          </span>
        )}
        {noChineseNeeded && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            No Chinese Req
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Briefcase className="w-3.5 h-3.5" />
          Part-time / Full-time
        </span>
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          View job <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
