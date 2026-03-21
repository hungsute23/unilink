"use client";

import React, { useState } from "react";
import { GraduationCap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeLogoProps {
  src?: string | null;
  alt?: string;
  size?: number;          // container px size (default 64)
  fallback?: "school" | "business";
  className?: string;
  imgClassName?: string;
}

/**
 * Renders a logo image with automatic icon fallback on error.
 * Works reliably even when Next.js Image optimizer returns non-error status for broken URLs.
 */
export function SafeLogo({
  src,
  alt = "Logo",
  size = 64,
  fallback = "school",
  className,
  imgClassName,
}: SafeLogoProps) {
  const [error, setError] = useState(false);

  const FallbackIcon = fallback === "business" ? Building2 : GraduationCap;
  const iconSize = Math.round(size * 0.5);

  const showImg = src && !error;

  return (
    <div
      className={cn("flex items-center justify-center overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        // Use plain <img> — onError fires reliably for all external URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-contain p-1.5", imgClassName)}
          onError={() => setError(true)}
          onLoad={(e) => {
            // Extra guard: broken images sometimes load with naturalWidth = 0
            if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) {
              setError(true);
            }
          }}
        />
      ) : (
        <FallbackIcon
          style={{ width: iconSize, height: iconSize }}
          className="text-muted-foreground/40"
        />
      )}
    </div>
  );
}
