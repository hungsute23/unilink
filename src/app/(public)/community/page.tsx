import type { Metadata } from "next";
import { getApprovedPosts, getCommunityStats } from "@/lib/appwrite/queries/community.queries";
import { PostCard } from "@/components/public/PostCard";
import { CommunitySearchBar } from "@/components/public/CommunitySearchBar";
import { Suspense } from "react";
import { PenSquare, BookOpen, Rss } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Community Blog | UniLink",
  description: "Real stories, tips, and experiences from international students, universities, and businesses in Taiwan.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [posts, stats] = await Promise.all([
    getApprovedPosts(100),
    getCommunityStats(),
  ]);

  const filtered = query
    ? posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : posts;

  const plainPosts = filtered.map(p => ({ ...p }));
  const [featured, ...rest] = query ? plainPosts : plainPosts; // no featured pin when searching

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ── */}
      <section className="border-b border-border bg-background">
        <div className="container px-6 mx-auto max-w-[1100px] py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Rss size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">UniLink Blog</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Community Stories
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                Real experiences from students, universities, and businesses — curated and approved by our team.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-1">
                <span><strong className="text-foreground">{stats.totalApproved}</strong> articles published</span>
                <span className="w-1 h-1 rounded-full bg-border inline-block" />
                <span>Updated weekly</span>
              </div>
            </div>
            <Link href="/student-portal/community/new" className="shrink-0">
              <Button className="btn-primary gap-2 h-12 px-8">
                <PenSquare size={16} /> Write a post
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-14 md:py-20">
        <div className="container px-6 mx-auto max-w-[1100px] space-y-10">

          {/* Search bar */}
          <Suspense>
            <div className="flex items-center gap-3">
              <CommunitySearchBar initialValue={query} />
              {query && (
                <p className="text-sm text-muted-foreground shrink-0">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;<strong>{query}</strong>&rdquo;
                </p>
              )}
            </div>
          </Suspense>

          {plainPosts.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <BookOpen size={28} className="text-primary" />
              </div>
              {query ? (
                <>
                  <h3 className="text-xl font-bold text-foreground">No results found</h3>
                  <p className="text-muted-foreground text-sm">Try a different keyword or clear the search.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground">No stories yet</h3>
                  <p className="text-muted-foreground">Be the first to share your Taiwan study experience!</p>
                  <Link href="/register">
                    <Button className="btn-primary gap-2 mt-2">
                      <PenSquare size={16} /> Write the first post
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured (only when not searching) */}
              {!query && featured && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Featured</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <PostCard post={featured} featured />
                </div>
              )}

              {/* Post grid */}
              {(query ? plainPosts : rest).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {query ? "Results" : "All posts"}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(query ? plainPosts : rest).map(post => (
                      <PostCard key={post.$id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
