"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveItem } from "@/lib/appwrite/actions/student.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  studentId?: string;
  itemId: string;
  itemType: "school" | "scholarship" | "job";
  initialIsSaved: boolean;
  className?: string;
  variant?: "outline" | "ghost" | "icon";
}

export function SaveButton({ 
  studentId, 
  itemId, 
  itemType, 
  initialIsSaved, 
  className = "",
  variant = "outline"
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (!studentId) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setIsSaved(!isSaved);

    try {
      const result = await toggleSaveItem(studentId, itemId, itemType);
      if (!result.success) {
        setIsSaved(!isSaved);
      } else {
        setIsSaved(!!result.isSaved);
      }
    } catch (error) {
      setIsSaved(!isSaved);
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        disabled={isLoading}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
          isSaved ? "bg-rose-500/10 text-rose-500" : "bg-muted/10 text-muted-foreground hover:bg-muted/20",
          className
        )}
      >
        <Heart className={cn("w-5 h-5", isSaved && "fill-rose-500")} />
      </button>
    );
  }

  return (
    <Button 
      variant={variant === "ghost" ? "ghost" : "outline"}
      size="sm" 
      className={cn(
        "gap-2 rounded-xl font-bold transition-all",
        isSaved ? "border-rose-500/30 text-rose-500 hover:bg-rose-500/5" : "border-primary/10",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isLoading}
    >
      <Heart className={cn("w-4 h-4", isSaved && "fill-rose-500 text-rose-500")} />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
