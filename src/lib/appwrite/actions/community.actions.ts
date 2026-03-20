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

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const slug = `${toSlug(title)}-${Date.now()}`;

    await databases.createDocument(DB, COL, ID.unique(), {
      authorId: user.$id,
      authorName: user.name,
      authorRole: (user.prefs as any)?.role || "student",
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/[#*]/g, "") + "...",
      tags,
      status: "pending",
    });

    revalidatePath("/student-portal/community");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePost(postId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const tagsRaw = formData.get("tags") as string;
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    await databases.updateDocument(DB, COL, postId, {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/[#*]/g, "") + "...",
      tags,
      status: "pending", // reset to pending after edit
    });

    revalidatePath("/student-portal/community");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePost(postId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DB, COL, postId);
    revalidatePath("/student-portal/community");
    revalidatePath("/community");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectPost(postId: string, reason: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB, COL, postId, {
      status: "rejected",
      rejectionReason: reason,
    });
    revalidatePath("/portal/community");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function incrementViewCount(postId: string, currentCount: number) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB, COL, postId, {
      viewCount: currentCount + 1,
    });
  } catch {
    // silent fail
  }
}
