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
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={cn("ns-card p-6 flex flex-col gap-5", className)}>
      {/* Header: logo left, name + info right */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl border border-border bg-background flex items-center justify-center p-2">
            {logoUrl && !imgError ? (
              <Image
                src={logoUrl}
                alt={name || "School logo"}
                width={48}
                height={48}
                className="object-contain rounded-lg"
                onError={() => setImgError(true)}
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

        {/* Name + meta */}
        <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/schools/${id}`}>
              <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
            <SaveButton
              variant="icon"
              itemId={id}
              itemType="school"
              initialIsSaved={isSaved}
              studentId={studentId}
              className="text-muted-foreground/40 hover:text-primary shrink-0 -mt-0.5"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-auto">
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
