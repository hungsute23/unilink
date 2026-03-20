"use client";

import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { useSearchParams } from "next/navigation";

interface MobileFilterDrawerProps {
  type: "schools" | "scholarships" | "jobs";
}

export function MobileFilterDrawer({ type }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeCount = Array.from(searchParams.keys()).filter(k => searchParams.get(k)).length;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-xl border border-[#eff2f6] bg-[#f9fcfe] text-sm font-semibold text-foreground hover:border-primary/30 transition-all"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        Filters
        {activeCount > 0 && (
          <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eff2f6]">
          <span className="font-bold text-foreground">Filters</span>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FilterSidebar type={type} className="w-full" />
        </div>
        <div className="px-5 py-4 border-t border-[#eff2f6]">
          <button
            onClick={() => setOpen(false)}
            className="w-full h-10 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}
