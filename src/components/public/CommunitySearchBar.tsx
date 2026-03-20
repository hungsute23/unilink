"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

export function CommunitySearchBar({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending
          ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          : <Search className="w-4 h-4 text-gray-400" />
        }
      </div>
      <input
        ref={inputRef}
        type="search"
        defaultValue={initialValue}
        placeholder="Search posts..."
        onChange={e => handleChange(e.target.value)}
        className="w-full h-10 pl-10 pr-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
      />
      {initialValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
