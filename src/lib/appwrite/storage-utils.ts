/**
 * Appwrite Storage utilities — server-side only.
 * Helper to extract file IDs from storage URLs and safely delete old files.
 */

/**
 * Extracts the Appwrite file ID from a storage view URL.
 *
 * URL format:
 *   https://<endpoint>/storage/buckets/<bucketId>/files/<fileId>/view?project=<projectId>
 *
 * Returns null if the URL is not a recognised Appwrite storage URL.
 */
export function extractAppwriteFileId(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    // Works for both /view and /download URLs
    const match = url.match(/\/files\/([^/?#]+)\//);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts the bucket ID from an Appwrite storage URL.
 * Returns null if not found.
 */
export function extractAppwriteBucketId(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const match = url.match(/\/buckets\/([^/?#]+)\/files/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Safely deletes an old Appwrite storage file.
 * Silently swallows "file not found" errors — useful for cleanup that shouldn't fail the main operation.
 *
 * @param storage  Appwrite Storage instance (from createSessionClient or createAdminClient)
 * @param oldUrl   The current file URL stored in the database
 * @param bucketId Optional explicit bucket — falls back to parsing from URL
 */
export async function deleteOldFile(
  storage: { deleteFile: (bucketId: string, fileId: string) => Promise<unknown> },
  oldUrl: string | undefined | null,
  bucketId?: string
): Promise<void> {
  const fileId = extractAppwriteFileId(oldUrl);
  if (!fileId) return;

  const bucket = bucketId ?? extractAppwriteBucketId(oldUrl);
  if (!bucket) return;

  try {
    await storage.deleteFile(bucket, fileId);
  } catch (err: any) {
    // 404 = file already gone — not an error worth logging
    if (err?.code !== 404) {
      console.warn(`[deleteOldFile] Could not delete ${bucket}/${fileId}:`, err?.message ?? err);
    }
  }
}
