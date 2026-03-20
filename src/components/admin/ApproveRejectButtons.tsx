"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { approvePost, rejectPost } from "@/lib/appwrite/actions/community.actions";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  postId: string;
  currentStatus: string;
}

export function ApproveRejectButtons({ postId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleApprove = () => {
    setAction("approve");
    startTransition(async () => {
      await approvePost(postId);
      router.refresh();
    });
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    if (!reason.trim()) return;
    setAction("reject");
    startTransition(async () => {
      await rejectPost(postId, reason.trim());
      setShowRejectInput(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      {currentStatus !== "approved" && (
        <Button
          onClick={handleApprove}
          disabled={isPending}
          size="sm"
          className="gap-1.5 rounded-xl h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
          {isPending && action === "approve" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <CheckCircle2 size={13} />
          )}
          Approve
        </Button>
      )}

      {currentStatus !== "rejected" && (
        <>
          {showRejectInput && (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={2}
                className="w-full text-xs p-2 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
          <Button
            onClick={handleReject}
            disabled={isPending || (showRejectInput && !reason.trim())}
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl h-9 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {isPending && action === "reject" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <XCircle size={13} />
            )}
            {showRejectInput ? "Confirm reject" : "Reject"}
          </Button>
          {showRejectInput && (
            <button
              onClick={() => { setShowRejectInput(false); setReason(""); }}
              className="text-xs text-muted-foreground hover:text-foreground text-center"
            >
              Cancel
            </button>
          )}
        </>
      )}

      {currentStatus === "approved" && (
        <Button
          onClick={handleReject}
          disabled={isPending}
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl h-9 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <XCircle size={13} /> Unpublish
        </Button>
      )}
    </div>
  );
}
