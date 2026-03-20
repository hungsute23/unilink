import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getPostsByAuthor } from "@/lib/appwrite/queries/community.queries";
import { Post } from "@/types/appwrite.types";
import { Button } from "@/components/ui/button";
import { PenSquare, Clock, CheckCircle2, XCircle, Eye, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeletePostButton } from "@/components/student/DeletePostButton";

export const metadata: Metadata = { title: "My Posts | UniLink" };

const STATUS_CONFIG = {
  pending:  { label: "Under review", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", icon: Clock },
  approved: { label: "Published",    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Rejected",     color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", icon: XCircle },
};

export default async function StudentCommunityPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const postsRaw = await getPostsByAuthor(user.$id);
  const posts = postsRaw.map((p) => JSON.parse(JSON.stringify(p))) as Post[];

  const counts = {
    total: posts.length,
    approved: posts.filter((p) => p.status === "approved").length,
    pending: posts.filter((p) => p.status === "pending").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Community Posts</h1>
          <p className="text-muted-foreground mt-1">Share your Taiwan study experience with the community.</p>
        </div>
        <Link href="/student-portal/community/new">
          <Button className="btn-primary gap-2 h-11">
            <PenSquare size={16} /> Write new post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total posts", count: counts.total, color: "text-foreground" },
          { label: "Published", count: counts.approved, color: "text-emerald-600" },
          { label: "Under review", count: counts.pending, color: "text-amber-600" },
          { label: "Rejected", count: counts.rejected, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="ns-card bg-card p-4 text-center">
            <div className={cn("text-3xl font-bold", s.color)}>{s.count}</div>
            <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="ns-card bg-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <FileText size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No posts yet</h3>
          <p className="text-muted-foreground text-sm">Share your experience to help other students!</p>
          <Link href="/student-portal/community/new">
            <Button className="btn-primary gap-2 mt-2">
              <PenSquare size={16} /> Write your first post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={post.$id} className="ns-card bg-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color)}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                    {post.status === "rejected" && post.rejectionReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800">
                        <strong>Rejection reason:</strong> {post.rejectionReason}
                      </p>
                    )}
                    {post.status === "approved" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye size={12} /> {post.viewCount ?? 0} views
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {post.status === "approved" && (
                      <Link href={`/community/${post.slug}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 text-xs font-semibold">
                          View <ArrowRight size={12} />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/student-portal/community/edit/${post.$id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs font-semibold">
                        Edit
                      </Button>
                    </Link>
                    <DeletePostButton postId={post.$id} />
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
