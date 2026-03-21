"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { revalidatePath } from "next/cache";

const DB = process.env.APPWRITE_DATABASE_ID!;
const COL = "Posts";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

export async function createPost(formData: FormData) {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const title   = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const excerpt = (formData.get("excerpt") as string)?.trim();
    const tagsRaw = formData.get("tags") as string;

    if (!title || title.length > 200)
      return { success: false, error: "Title must be 1–200 characters." };
    if (!content || content.length < 10)
      return { success: false, error: "Content is too short." };
    if (content.length > 20000)
      return { success: false, error: "Content too long (max 20,000 characters)." };

    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean).slice(0, 10)
      : [];

    const slug = `${toSlug(title)}-${Date.now()}`;
    const autoExcerpt = excerpt || content.replace(/[#*`_[\]()>!|]/g, "").substring(0, 200) + "...";

    await databases.createDocument(DB, COL, ID.unique(), {
      authorId:   user.$id,
      authorName: user.name,
      authorRole: (user.prefs as Record<string, string>)?.role || "student",
      title,
      slug,
      content,
      excerpt: autoExcerpt.slice(0, 300),
      tags,
      status: "pending",
    });

    revalidatePath("/student-portal/community");
    return { success: true };
  } catch (error) {
    console.error("[createPost]", error);
    return { success: false, error: "Failed to create post. Please try again." };
  }
}

export async function updatePost(postId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const title   = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const excerpt = (formData.get("excerpt") as string)?.trim();
    const tagsRaw = formData.get("tags") as string;

    if (!title || title.length > 200)
      return { success: false, error: "Title must be 1–200 characters." };
    if (!content || content.length < 10)
      return { success: false, error: "Content is too short." };
    if (content.length > 20000)
      return { success: false, error: "Content too long (max 20,000 characters)." };

    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean).slice(0, 10)
      : [];

    const autoExcerpt = excerpt || content.replace(/[#*`_[\]()>!|]/g, "").substring(0, 200) + "...";

    await databases.updateDocument(DB, COL, postId, {
      title,
      content,
      excerpt: autoExcerpt.slice(0, 300),
      tags,
      status: "pending", // reset to pending after edit
    });

    revalidatePath("/student-portal/community");
    return { success: true };
  } catch (error) {
    console.error("[updatePost]", error);
    return { success: false, error: "Failed to update post. Please try again." };
  }
}

export async function deletePost(postId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DB, COL, postId);
    revalidatePath("/student-portal/community");
    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    console.error("[deletePost]", error);
    return { success: false, error: "Failed to delete post." };
  }
}

export async function approvePost(postId: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB, COL, postId, {
      status: "approved",
      publishedAt: new Date().toISOString(),
      rejectionReason: null,
    });
    revalidatePath("/portal/community");
    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    console.error("[approvePost]", error);
    return { success: false, error: "Failed to approve post." };
  }
}

export async function rejectPost(postId: string, reason: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB, COL, postId, {
      status: "rejected",
      rejectionReason: reason.slice(0, 500),
    });
    revalidatePath("/portal/community");
    return { success: true };
  } catch (error) {
    console.error("[rejectPost]", error);
    return { success: false, error: "Failed to reject post." };
  }
}

export async function incrementViewCount(postId: string, currentCount: number) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB, COL, postId, { viewCount: currentCount + 1 });
  } catch {
    // non-critical — silent fail is acceptable
  }
}
