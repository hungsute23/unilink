"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/appwrite/actions/community.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    startTransition(async () => {
      await deletePost(postId);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-xl h-9 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </Button>
  );
}
