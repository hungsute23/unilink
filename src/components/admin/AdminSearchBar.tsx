"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSearchBarProps {
  placeholder?: string;
  showStatusFilter?: boolean;
}

const STATUS_OPTIONS = [
  { value: "all",      label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending",  label: "Pending" },
];

export function AdminSearchBar({ placeholder = "Search...", showStatusFilter = false }: AdminSearchBarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ      = params.get("q") ?? "";
  const currentStatus = params.get("status") ?? "all";

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }, [params, pathname, router]);

  return (
    <div className="flex items-center gap-2">
      {/* Search input */}
      <div className="relative group w-64">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
          isPending ? "text-primary animate-pulse" : "text-muted-foreground group-focus-within:text-primary"
        )} />
        <Input
          defaultValue={currentQ}
          placeholder={placeholder}
          onChange={(e) => update("q", e.target.value)}
          className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Status filter */}
      {showStatusFilter && (
        <div className="flex items-center gap-1 bg-muted/30 rounded-2xl p-1 h-12">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("status", opt.value)}
              className={cn(
                "px-3 h-8 rounded-xl text-xs font-semibold transition-all duration-150",
                currentStatus === opt.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
