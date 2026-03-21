"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SafeLogo } from "@/components/shared/SafeLogo";

interface School {
  $id: string;
  schoolName: string;
  city?: string;
  type?: string;
  logoUrl?: string;
  description?: string;
}

function SlideCard({ school }: { school: School }) {
  return (
    <div className="ns-card p-6 flex flex-col gap-5 h-full group">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-xl border border-border bg-background">
            <SafeLogo src={school.logoUrl} alt={school.schoolName || "School logo"} size={64} fallback="school" />
          </div>
          <div className="absolute -right-1.5 -bottom-1.5 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
          <Link href={`/schools/${school.$id}`}>
            <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {school.schoolName}
            </h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {school.city && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {school.city}
              </span>
            )}
            {school.type && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {school.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {school.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {school.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
        </span>
        <Link
          href={`/schools/${school.$id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors"
        >
          View details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

const CARD_WIDTH = 360;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

export function SchoolsSlider({ schools }: { schools: School[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Infinite: prepend + append clones
  const items = [...schools, ...schools, ...schools];

  const initScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // Start at the middle copy so we can scroll both ways
    el.scrollLeft = schools.length * STEP;
  }, [schools.length]);

  useEffect(() => {
    initScroll();
  }, [initScroll]);

  // After smooth scroll ends, silently jump to middle clone if needed
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const min = STEP;                              // 1 card from left edge
    const max = schools.length * 2 * STEP;        // 1 set from right edge

    if (el.scrollLeft < min) {
      // jumped past start — teleport to same position in middle set
      el.scrollLeft += schools.length * STEP;
    } else if (el.scrollLeft > max) {
      // jumped past end — teleport to same position in middle set
      el.scrollLeft -= schools.length * STEP;
    }
  }, [schools.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? STEP * 2 : -STEP * 2, behavior: "smooth" });
  };

  return (
    <div className="relative px-6">
      {/* Prev */}
      <button
        onClick={() => scroll("prev")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-[#eff2f6] dark:border-white/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto py-4 -my-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((school, i) => (
          <div
            key={`${school.$id}-${i}`}
            className="shrink-0"
            style={{ width: CARD_WIDTH, scrollSnapAlign: "start" }}
          >
            <SlideCard school={school} />
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => scroll("next")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-[#eff2f6] dark:border-white/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-6 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent z-[1]" />
      <div className="pointer-events-none absolute right-6 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent z-[1]" />
    </div>
  );
}
