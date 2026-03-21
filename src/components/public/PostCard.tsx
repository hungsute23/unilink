"use client";

import Link from "next/link";
import { Post } from "@/types/appwrite.types";
import { Eye, Clock, GraduationCap, Building2, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { label: string; icon: React.ElementType; bar: string; avatar: string; badge: string }> = {
  student:  { label: "Student",    icon: GraduationCap, bar: "from-indigo-500 to-blue-500",    avatar: "bg-indigo-500",  badge: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" },
  school:   { label: "University", icon: Building2,     bar: "from-violet-500 to-purple-500",  avatar: "bg-violet-500",  badge: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20" },
  business: { label: "Business",   icon: Briefcase,     bar: "from-emerald-500 to-teal-500",   avatar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
};

function readingTime(content: string) {
  const mins = Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
  return `${mins} min`;
}

function AuthorAvatar({ name, role }: { name: string; role: string }) {
  const meta = ROLE_META[role] ?? ROLE_META.student;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0", meta.avatar)}>
      {initials || <meta.icon className="w-3.5 h-3.5" />}
    </div>
  );
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
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const rt = readingTime(post.content ?? "");

  /* ── Featured (hero) card ── */
  if (featured) {
    return (
      <article className={cn("bg-[#f9fcfe] dark:bg-white/5 border border-[#eff2f6] dark:border-white/10 rounded-2xl overflow-hidden", className)}>
        {/* Colour bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${meta.bar}`} />

        <div className="p-7 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="space-y-4 min-w-0">
            {/* Role badge */}
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border", meta.badge)}>
              <RoleIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>

            {/* Title */}
            <Link href={`/community/${post.slug}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 text-sm md:text-base">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author + meta */}
            <div className="flex items-center gap-3 pt-1">
              <AuthorAvatar name={post.authorName ?? ""} role={post.authorRole} />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{post.authorName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rt} read</span>
                  {post.viewCount != null && (
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Read more CTA */}
          <Link
            href={`/community/${post.slug}`}
            className="shrink-0 hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl transition-all"
          >
            Read more
          </Link>
        </div>
      </article>
    );
  }

  /* ── Regular card ── */
  return (
    <article className={cn("bg-[#f9fcfe] dark:bg-white/5 border border-[#eff2f6] dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm transition-all", className)}>
      {/* Colour bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.bar}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Role badge */}
        <span className={cn("self-start inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border", meta.badge)}>
          <RoleIcon className="w-3 h-3" />
          {meta.label}
        </span>

        {/* Title */}
        <Link href={`/community/${post.slug}`}>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <AuthorAvatar name={post.authorName ?? ""} role={post.authorRole} />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
              {post.authorName}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 shrink-0">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rt}</span>
            {post.viewCount != null && (
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
