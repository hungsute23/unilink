"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface FilterOption { label: string; value: string }
interface FilterGroup  { key: string; title: string; multi?: boolean; options: FilterOption[] }

/* ── Config per page type ── */
const CONFIG: Record<"schools" | "scholarships" | "jobs", FilterGroup[]> = {
  schools: [
    {
      key: "city", title: "City", options: [
        { label: "Taipei",    value: "Taipei" },
        { label: "Taichung",  value: "Taichung" },
        { label: "Tainan",   value: "Tainan" },
        { label: "Kaohsiung",value: "Kaohsiung" },
        { label: "Hsinchu",  value: "Hsinchu" },
      ]
    },
    {
      key: "type", title: "Institution Type", options: [
        { label: "Public University",  value: "public" },
        { label: "Private University", value: "private" },
        { label: "Vocational",         value: "vocational" },
      ]
    },
  ],
  scholarships: [
    {
      key: "source", title: "Source", options: [
        { label: "Government",   value: "government" },
        { label: "University",   value: "school_based" },
        { label: "Private Fund", value: "private" },
      ]
    },
    {
      key: "covers", title: "Coverage", multi: true, options: [
        { label: "Tuition", value: "tuition" },
        { label: "Stipend", value: "stipend" },
        { label: "Dorm",    value: "dorm" },
      ]
    },
  ],
  jobs: [
    {
      key: "type", title: "Job Type", options: [
        { label: "Part-time",  value: "Part-time" },
        { label: "Full-time",  value: "Full-time" },
        { label: "Internship", value: "Internship" },
      ]
    },
    {
      key: "visa", title: "Visa Friendly", options: [
        { label: "Visa Friendly Only", value: "true" },
      ]
    },
    {
      key: "chinese", title: "Chinese Required", options: [
        { label: "No Requirement", value: "none" },
        { label: "Basic",          value: "basic" },
        { label: "Fluent",         value: "fluent" },
      ]
    },
  ],
};

interface FilterSidebarProps {
  type: "schools" | "scholarships" | "jobs";
  className?: string;
}

export function FilterSidebar({ type, className }: FilterSidebarProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams= useSearchParams();
  const groups      = CONFIG[type];

  const get = (key: string) => searchParams.get(key) ?? "";

  const set = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const toggle = (key: string, value: string) => {
    const current = get(key).split(",").filter(Boolean);
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    set(key, next.join(","));
  };

  const isActive = (key: string, value: string, multi?: boolean) => {
    if (multi) return get(key).split(",").includes(value);
    return get(key) === value;
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const activeCount = groups.reduce((n, g) => n + (get(g.key) ? 1 : 0), 0)
    + (get("q") ? 1 : 0);

  return (
    <aside className={cn("w-64 shrink-0 space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Filters</h2>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder={`Search ${type}...`}
          defaultValue={get("q")}
          onChange={e => {
            const v = e.target.value.trim();
            set("q", v);
          }}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#eff2f6] bg-[#f9fcfe] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </div>

      {/* Filter groups */}
      {groups.map(group => (
        <div key={group.key} className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.options.map(opt => {
              const active = isActive(group.key, opt.value, group.multi);
              return (
                <button
                  key={opt.value}
                  onClick={() => group.multi
                    ? toggle(group.key, opt.value)
                    : set(group.key, active ? "" : opt.value)
                  }
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm font-medium transition-all text-left",
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#f0f2f8] border border-transparent"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                    active ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {active && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
