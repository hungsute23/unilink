import type { Metadata } from "next";
import { getAllPostsForAdmin } from "@/lib/appwrite/queries/community.queries";
import { Post } from "@/types/appwrite.types";
import { ApproveRejectButtons } from "@/components/admin/ApproveRejectButtons";
import { Clock, CheckCircle2, XCircle, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Community Moderation | Admin" };

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default async function AdminCommunityPage() {
  const postsRaw = await getAllPostsForAdmin();
  const posts = postsRaw.map((p) => JSON.parse(JSON.stringify(p))) as Post[];

  const counts = {
    all: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    approved: posts.filter((p) => p.status === "approved").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Community Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and approve posts submitted by users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "All posts", count: counts.all, color: "text-foreground" },
          { label: "Pending review", count: counts.pending, color: "text-amber-600" },
          { label: "Approved", count: counts.approved, color: "text-emerald-600" },
          { label: "Rejected", count: counts.rejected, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="ns-card bg-card p-4 text-center">
            <div className={cn("text-3xl font-bold", s.color)}>{s.count}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending first, then rest */}
      {posts.length === 0 ? (
        <div className="ns-card bg-card p-16 text-center space-y-3">
          <FileText size={32} className="text-muted-foreground mx-auto" />
          <p className="text-muted-foreground font-medium">No posts to moderate.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...posts].sort((a, b) => {
            // pending first
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (b.status === "pending" && a.status !== "pending") return 1;
            return 0;
          }).map((post) => {
            const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={post.$id} className="ns-card bg-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color)}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border capitalize">
                        {post.authorRole}
                      </span>
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">by <strong>{post.authorName}</strong> · {new Date(post.$createdAt).toLocaleDateString()}</p>
                    </div>

                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}

                    {/* Content preview */}
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-primary font-semibold hover:underline list-none">
                        Preview content ▾
                      </summary>
                      <div className="mt-3 p-4 rounded-2xl bg-muted/50 text-sm text-foreground/80 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed">
                        {post.content}
                      </div>
                    </details>

                    {post.status === "rejected" && post.rejectionReason && (
                      <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                        <strong>Rejection reason:</strong> {post.rejectionReason}
                      </p>
                    )}

                    {post.status === "approved" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye size={12} /> {post.viewCount ?? 0} views
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <ApproveRejectButtons postId={post.$id} currentStatus={post.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
