import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getApprovedPosts } from "@/lib/appwrite/queries/community.queries";
import { incrementViewCount } from "@/lib/appwrite/actions/community.actions";
import { PostCard } from "@/components/public/PostCard";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Eye, Clock,
  GraduationCap, Building2, Briefcase, User,
  PenSquare, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLE_META: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  student:  { label: "Student",    icon: GraduationCap, gradient: "from-blue-500/15 to-indigo-500/5" },
  school:   { label: "University", icon: Building2,     gradient: "from-violet-500/15 to-purple-500/5" },
  business: { label: "Business",   icon: Briefcase,     gradient: "from-emerald-500/15 to-teal-500/5" },
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function renderMarkdown(text: string): string {
  return text
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Unordered lists (wrap consecutive li in ul)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`)
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Paragraphs — wrap double-newline blocks
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found | UniLink" };
  return {
    title: `${post.title} | UniLink Community`,
    description: post.excerpt,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;

  const [post, relatedRaw] = await Promise.all([
    getPostBySlug(slug),
    getApprovedPosts(4),
  ]);

  if (!post) notFound();

  // Fire and forget view count
  incrementViewCount(post.$id, post.viewCount ?? 0);

  const meta = ROLE_META[post.authorRole] ?? ROLE_META.student;
  const RoleIcon = meta.icon;
  const rt = readingTime(post.content ?? "");
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  // Related posts — exclude current, serialize to plain objects
  const related = relatedRaw.filter((p) => p.slug !== slug).slice(0, 3).map((p) => ({ ...p }));

  return (
    <div className="min-h-screen bg-background">

      {/* ── Cover / Hero ── */}
      <div className={`w-full h-2 bg-gradient-to-r ${meta.gradient.replace("/15","").replace("/5","")}`} />

      <div className="container px-6 mx-auto max-w-[1100px] py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">

          {/* ── Main article ── */}
          <div className="min-w-0">

            {/* Back */}
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-10 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Community
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-[42px] font-bold text-foreground leading-tight mb-6 tracking-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 pb-8 border-b border-border/60 font-medium">
                {post.excerpt}
              </p>
            )}

            {/* Author + meta bar */}
            <div className="flex items-center gap-4 mb-10 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${meta.gradient} border border-border flex items-center justify-center`}>
                  <RoleIcon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{meta.label}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                {publishedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} /> {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={13} /> {rt} min read
                </span>
                {post.viewCount != null && (
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} /> {(post.viewCount + 1).toLocaleString()} views
                  </span>
                )}
              </div>
            </div>

            {/* Article content */}
            <article
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* Tags footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground mr-2">Tagged:</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author card bottom */}
            <div className={`mt-12 p-6 rounded-[28px] bg-gradient-to-br ${meta.gradient} border border-border/60 flex items-start gap-4`}>
              <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <RoleIcon size={22} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Written by</p>
                <p className="text-lg font-bold text-foreground">{post.authorName}</p>
                <p className="text-sm text-muted-foreground capitalize">{meta.label} on UniLink</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 ns-card bg-card p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-foreground">Have your own story to share?</h3>
              <p className="text-muted-foreground">Inspire other students with your Taiwan experience.</p>
              <Link href="/student-portal/community/new">
                <Button className="btn-primary gap-2 mt-1">
                  <PenSquare size={16} /> Write a post
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-8 hidden lg:block">

            {/* Reading progress info */}
            <div className="ns-card bg-card p-5 space-y-4 sticky top-24">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                About this article
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reading time</span>
                  <span className="font-semibold text-foreground">{rt} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-semibold text-foreground">{(post.viewCount ?? 0) + 1}</span>
                </div>
                {publishedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-semibold text-foreground text-right text-xs">
                      {new Date(post.publishedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Author</span>
                  <span className="font-semibold text-foreground capitalize">{meta.label}</span>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border/60">
                <Link href="/student-portal/community/new">
                  <Button variant="outline" className="w-full btn-secondary gap-2 text-sm">
                    <PenSquare size={14} /> Write your story
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related posts ── */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/60">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">More from the community</span>
              <div className="flex-1 h-px bg-border" />
              <Link href="/community" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <PostCard key={p.$id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
