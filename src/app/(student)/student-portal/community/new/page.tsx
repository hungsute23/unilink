import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { PostEditor } from "@/components/student/PostEditor";

export const metadata: Metadata = { title: "Write a Post | UniLink" };

export default async function NewPostPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  return (
    <div className="py-4">
      <PostEditor />
    </div>
  );
}
