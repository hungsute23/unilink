"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost } from "@/lib/appwrite/actions/community.actions";
import { Post } from "@/types/appwrite.types";
import { ArrowLeft, Loader2, Send, Info } from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
  post?: Post; // if provided → edit mode
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(post?.content?.length ?? 0);

  const isEdit = !!post;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = isEdit
        ? await updatePost(post.$id, formData)
        : await createPost(formData);

      if (!res.success) {
        setError(res.error ?? "Something went wrong");
        return;
      }
      router.push("/student-portal/community");
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/student-portal/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to my posts
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">
          {isEdit ? "Edit post" : "Write a new post"}
        </h1>
        <p className="text-muted-foreground">
          Your post will be reviewed by our team before being published.
        </p>
      </div>

      {/* Notice */}
      <div className="flex gap-3 p-4 rounded-2xl bg-primary/8 border border-primary/20 text-sm">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p className="text-foreground/80">
          Posts are reviewed within <strong>24 hours</strong>. Keep content relevant to study abroad, scholarships, or careers in Taiwan. Avoid spam or promotional content.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="ns-card bg-card p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold">Post title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={post?.title}
            placeholder="e.g. How I got the MOE Scholarship in 2025"
            required
            maxLength={255}
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-sm font-semibold">Content *</Label>
            <span className="text-xs text-muted-foreground">{charCount} / 50,000</span>
          </div>
          <Textarea
            id="content"
            name="content"
            defaultValue={post?.content}
            placeholder="Share your experience, tips, or story... You can use Markdown formatting."
            required
            rows={16}
            maxLength={50000}
            onChange={(e) => setCharCount(e.target.value.length)}
            className="rounded-2xl resize-y min-h-[300px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">Markdown is supported: **bold**, *italic*, ## heading, - list</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-sm font-semibold">Short description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            defaultValue={post?.excerpt}
            placeholder="A 1-2 sentence summary shown on the community listing..."
            rows={2}
            maxLength={500}
            className="rounded-2xl resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-semibold">Tags <span className="text-muted-foreground font-normal">(optional, comma-separated)</span></Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={post?.tags?.join(", ")}
            placeholder="e.g. MOE scholarship, NTU, visa, part-time job"
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="btn-primary gap-2 h-12 px-8"
          >
            {isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <><Send size={18} /> {isEdit ? "Update & resubmit" : "Submit for review"}</>
            )}
          </Button>
          <Link href="/student-portal/community">
            <Button variant="ghost" type="button" className="btn-secondary h-12 px-8 bg-transparent">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
