"use client";

import Link from "next/link";
import { Post } from "@/types/appwrite.types";
import { Eye, Calendar, Clock, GraduationCap, Building2, Briefcase, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  student:  { label: "Student",    icon: GraduationCap, gradient: "from-blue-500/20 to-indigo-500/10" },
  school:   { label: "University", icon: Building2,     gradient: "from-violet-500/20 to-purple-500/10" },
  business: { label: "Business",   icon: Briefcase,     gradient: "from-emerald-500/20 to-teal-500/10" },
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

interface PostCardProps {
  post: Post;
  featured?: boolean;
  className?: string;
}

export function PostCard({ post, featured = false, className }: PostCardProps) {
  const meta = ROLE_META[post.authorRole] ?? ROLE_META.student;
  const RoleIcon = meta.icon;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const rt = readingTime(post.content ?? "");

  if (featured) {
    return (
      <Link href={`/community/${post.slug}`} className={cn("block group", className)}>
        <div className="ns-card bg-card overflow-hidden">
          {/* Cover gradient */}
          <div className={cn("h-56 md:h-72 bg-gradient-to-br relative", meta.gradient, "bg-card")}>
            <div className="absolute inset-0 bg-dot-pattern opacity-30" />
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold text-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 space-y-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <RoleIcon size={14} className="text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{post.authorName}</span>
                <span className="text-xs text-muted-foreground ml-2">{meta.label}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
            )}

            {/* Footer */}
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              {date && <span className="flex items-center gap-1"><Calendar size={12} />{date}</span>}
              <span className="flex items-center gap-1"><Clock size={12} />{rt}</span>
              {post.viewCount != null && (
                <span className="flex items-center gap-1"><Eye size={12} />{post.viewCount} views</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/community/${post.slug}`} className={cn("block group", className)}>
      <article className="ns-card bg-card overflow-hidden h-full flex flex-col">
        {/* Cover gradient strip */}
        <div className={cn("h-3 bg-gradient-to-r", meta.gradient.replace("/20", "").replace("/10", ""))} />

        <div className="p-6 flex flex-col gap-4 flex-1">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
          )}

          {/* Author + meta */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <RoleIcon size={12} className="text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={11} />{rt}</span>
              {date && <span className="hidden sm:flex items-center gap-1"><Calendar size={11} />{date}</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
