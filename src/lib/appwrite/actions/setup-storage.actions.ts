"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Permission, Role } from "node-appwrite";

/**
 * Creates the required Appwrite Storage buckets for UniLink.
 *
 * Buckets created:
 *  - unilink_media      : Avatars, logos, school images — public read, 5MB, images only
 *  - unilink_documents  : Application documents — authenticated read, 10MB, images + PDF
 *
 * Run once from /seed page. After running, add the returned IDs to .env:
 *  NEXT_PUBLIC_APPWRITE_BUCKET_MEDIA_ID=<mediaBucketId>
 *  APPWRITE_BUCKET_DOCUMENTS_ID=<documentsBucketId>
 */
export async function setupStorageBuckets() {
  try {
    const { storage } = await createAdminClient();

    const results: { name: string; id: string; status: "created" | "exists" | "error"; note?: string }[] = [];

    // ── 1. Media bucket (public read) ──────────────────────────────────────────
    const mediaBucketId = "unilink_media";
    try {
      const media = await storage.createBucket({
        bucketId: mediaBucketId,
        name: "UniLink Media",
        permissions: [
          Permission.read(Role.any()),           // anyone can view images
          Permission.create(Role.users()),       // logged-in users can upload
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 5 * 1024 * 1024,       // 5MB
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
        compression: "none" as any,
        encryption: true,
        antivirus: true,
      });
      results.push({ name: "UniLink Media", id: media.$id, status: "created" });
    } catch (err: any) {
      if (err?.code === 409) {
        results.push({ name: "UniLink Media", id: mediaBucketId, status: "exists", note: "Already exists" });
      } else {
        results.push({ name: "UniLink Media", id: mediaBucketId, status: "error", note: err?.message });
      }
    }

    // ── 2. Documents bucket (authenticated read) ───────────────────────────────
    const docsBucketId = "unilink_documents";
    try {
      const docs = await storage.createBucket({
        bucketId: docsBucketId,
        name: "UniLink Documents",
        permissions: [
          Permission.read(Role.users()),         // only logged-in users can read
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        fileSecurity: true,                      // each file can have its own permissions
        enabled: true,
        maximumFileSize: 10 * 1024 * 1024,      // 10MB
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "pdf"],
        compression: "none" as any,
        encryption: true,
        antivirus: true,
      });
      results.push({ name: "UniLink Documents", id: docs.$id, status: "created" });
    } catch (err: any) {
      if (err?.code === 409) {
        results.push({ name: "UniLink Documents", id: docsBucketId, status: "exists", note: "Already exists" });
      } else {
        results.push({ name: "UniLink Documents", id: docsBucketId, status: "error", note: err?.message });
      }
    }

    const hasError = results.some(r => r.status === "error");

    return {
      success: !hasError,
      results,
      envHint: [
        `NEXT_PUBLIC_APPWRITE_BUCKET_MEDIA_ID=${mediaBucketId}`,
        `APPWRITE_BUCKET_DOCUMENTS_ID=${docsBucketId}`,
      ],
    };
  } catch (error: any) {
    console.error("[setupStorageBuckets]", error);
    return { success: false, error: "Failed to setup storage buckets." };
  }
}

/**
 * Lists all existing buckets — useful to verify setup.
 */
export async function listStorageBuckets() {
  try {
    const { storage } = await createAdminClient();
    const response = await storage.listBuckets();
    return {
      success: true,
      buckets: response.buckets.map(b => ({
        id: b.$id,
        name: b.name,
        enabled: b.enabled,
        maximumFileSize: b.$id,
        allowedExtensions: b.allowedFileExtensions,
      })),
    };
  } catch (error) {
    console.error("[listStorageBuckets]", error);
    return { success: false, buckets: [] };
  }
}
