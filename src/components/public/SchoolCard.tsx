"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { SaveButton } from "@/components/shared/SaveButton";
import { cn } from "@/lib/utils";

interface SchoolCardProps {
  id: string;
  name: string;
  city: string;
  type?: string;
  logoUrl?: string;
  description?: string;
  isSaved?: boolean;
  studentId?: string;
  isVerified?: boolean;
  className?: string;
}

export function SchoolCard({
  id,
  name,
  city,
  type,
  logoUrl,
  description,
  isSaved = false,
  studentId,
  isVerified = true,
  className,
}: SchoolCardProps) {
  return (
    <div className={cn("ns-card bg-card p-6 flex flex-col gap-5", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border border-border bg-background flex items-center justify-center p-2 group-hover:border-primary/40 transition-colors">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={48}
                height={48}
                className="object-contain rounded-lg"
              />
            ) : (
              <GraduationCap className="w-8 h-8 text-primary/50" />
            )}
          </div>
          {isVerified && (
            <div className="absolute -right-1.5 -bottom-1.5 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
        </div>

        <SaveButton
          variant="icon"
          itemId={id}
          itemType="school"
          initialIsSaved={isSaved}
          studentId={studentId}
          className="text-muted-foreground/40 hover:text-primary"
        />
      </div>

      {/* Info */}
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {city || "Taiwan"}
          </span>
          {type && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {type}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Partner
        </span>
        <Link
          href={`/schools/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors"
        >
          View details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
