"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const goTo = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    if (page === 1) p.delete("page"); else p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`, { scroll: true });
  };

  // Build page number list with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#eff2f6] bg-[#f9fcfe] text-muted-foreground hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all",
              p === currentPage
                ? "bg-primary text-white shadow-sm"
                : "border border-[#eff2f6] bg-[#f9fcfe] text-muted-foreground hover:text-primary hover:border-primary/30"
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#eff2f6] bg-[#f9fcfe] text-muted-foreground hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
