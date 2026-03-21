import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { Post } from "@/types/appwrite.types";

const DB = process.env.APPWRITE_DATABASE_ID!;
const COL = "Posts";

export async function getApprovedPosts(limit = 20, offset = 0): Promise<Post[]> {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("status", "approved"),
      Query.orderDesc("publishedAt"),
      Query.limit(limit),
      Query.offset(offset),
    ]);
    return res.documents as unknown as Post[];
  } catch (error) {
    console.error("[getApprovedPosts]", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("slug", slug),
      Query.equal("status", "approved"),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return null;
    return res.documents[0] as unknown as Post;
  } catch (error) {
    console.error("[getPostBySlug]", error);
    return null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.getDocument(DB, COL, id);
    return doc as unknown as Post;
  } catch (error) {
    console.error("[getPostById]", error);
    return null;
  }
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("authorId", authorId),
      Query.orderDesc("$createdAt"),
    ]);
    return res.documents as unknown as Post[];
  } catch (error) {
    console.error("[getPostsByAuthor]", error);
    return [];
  }
}

export async function getPendingPosts(): Promise<Post[]> {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(DB, COL, [
      Query.equal("status", "pending"),
      Query.orderDesc("$createdAt"),
    ]);
    return res.documents as unknown as Post[];
  } catch (error) {
    console.error("[getPendingPosts]", error);
    return [];
  }
}

export async function getAllPostsForAdmin(): Promise<Post[]> {
  try {
    const { databases } = await createAdminClient();
    const res = await databases.listDocuments(DB, COL, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return res.documents as unknown as Post[];
  } catch (error) {
    console.error("[getAllPostsForAdmin]", error);
    return [];
  }
}

export async function getCommunityStats() {
  try {
    const { databases } = await createAdminClient();
    const [approved, pending] = await Promise.all([
      databases.listDocuments(DB, COL, [Query.equal("status", "approved"), Query.limit(1)]),
      databases.listDocuments(DB, COL, [Query.equal("status", "pending"), Query.limit(1)]),
    ]);
    return { totalApproved: approved.total, totalPending: pending.total };
  } catch (error) {
    console.error("[getCommunityStats]", error);
    return { totalApproved: 0, totalPending: 0 };
  }
}
