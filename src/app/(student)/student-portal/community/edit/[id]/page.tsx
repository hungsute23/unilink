import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getPostById } from "@/lib/appwrite/queries/community.queries";
import { PostEditor } from "@/components/student/PostEditor";

export const metadata: Metadata = { title: "Edit Post | UniLink" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const postRaw = await getPostById(id);
  if (!postRaw || postRaw.authorId !== user.$id) notFound();

  const post = JSON.parse(JSON.stringify(postRaw));

  return (
    <div className="py-4">
      <PostEditor post={post} />
    </div>
  );
}
