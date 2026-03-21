"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";
import { deleteOldFile } from "@/lib/appwrite/storage-utils";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const STUDENTS_COLLECTION = "Students";
const SAVED_ITEMS_COLLECTION = "Saved_Items";
const MEDIA_BUCKET  = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MEDIA_ID || "unilink_media";
const DOCS_BUCKET   = process.env.APPWRITE_BUCKET_DOCUMENTS_ID || "unilink_documents";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_DOC_SIZE   = 10 * 1024 * 1024;  // 10MB

function validateFile(file: File, types: string[], maxBytes: number): string | null {
  if (!types.includes(file.type))
    return `Invalid file type. Allowed: ${types.map(t => t.split("/")[1].toUpperCase()).join(", ")}.`;
  if (file.size > maxBytes)
    return `File too large. Maximum ${maxBytes / 1024 / 1024}MB.`;
  return null;
}

export async function updateStudentProfile(documentId: string, formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();

    const currentAvatarUrl = formData.get("currentAvatarUrl") as string | undefined;
    let avatarUrl = currentAvatarUrl;
    const avatarFile = formData.get("avatarFile") as File | null;

    // 1. Validate, upload new avatar, delete old one atomically
    if (avatarFile && avatarFile.size > 0) {
      const err = validateFile(avatarFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);
      if (err) return { success: false, error: err };

      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const inputFile = InputFile.fromBuffer(buffer, avatarFile.name);
      const uploadedFile = await storage.createFile(MEDIA_BUCKET, ID.unique(), inputFile);

      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${MEDIA_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`;

      // Delete old avatar after new one is safely uploaded
      await deleteOldFile(storage, currentAvatarUrl, MEDIA_BUCKET);
    }

    // 2. Validate inputs
    const fullName = (formData.get("fullName") as string)?.trim();
    const gpa = (formData.get("gpa") as string)?.trim();
    const vietnameseId = (formData.get("vietnameseId") as string)?.trim();

    if (fullName && fullName.length > 100)
      return { success: false, error: "Full name too long (max 100 characters)." };
    if (gpa && (isNaN(Number(gpa)) || Number(gpa) < 0 || Number(gpa) > 4))
      return { success: false, error: "GPA must be a number between 0 and 4." };
    if (vietnameseId && vietnameseId.length > 20)
      return { success: false, error: "ID number too long." };

    // 3. Update database
    await databases.updateDocument(DATABASE_ID, STUDENTS_COLLECTION, documentId, {
      fullName,
      nationality: (formData.get("nationality") as string)?.trim(),
      highestEducation: formData.get("highestEducation") as string,
      englishLevel: formData.get("englishLevel") as string,
      chineseLevel: formData.get("chineseLevel") as string,
      gpa,
      targetDegree: formData.get("targetDegree") as string,
      targetCityTaiwan: formData.get("targetCityTaiwan") as string,
      hasPassport: formData.get("hasPassport") === "true",
      workPermitStatus: formData.get("workPermitStatus") as string,
      vietnameseId,
      ...(avatarUrl && { avatarUrl }),
    });

    revalidatePath("/student-portal/profile");
    revalidatePath("/student-portal");
    return { success: true };
  } catch (error) {
    console.error("[updateStudentProfile]", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

export async function toggleSaveItem(studentId: string, itemId: string, itemType: "school" | "scholarship" | "job") {
  try {
    const { databases } = await createSessionClient();

    const existing = await databases.listDocuments(DATABASE_ID, SAVED_ITEMS_COLLECTION, [
      Query.equal("studentId", studentId),
      Query.equal("itemId", itemId),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, SAVED_ITEMS_COLLECTION, existing.documents[0].$id);
      revalidatePath(`/schools/${itemId}`);
      revalidatePath(`/scholarships/${itemId}`);
      revalidatePath(`/jobs/${itemId}`);
      revalidatePath("/student-portal/saved");
      return { success: true, isSaved: false };
    } else {
      await databases.createDocument(DATABASE_ID, SAVED_ITEMS_COLLECTION, ID.unique(), {
        studentId,
        itemId,
        itemType,
        savedAt: new Date().toISOString(),
      });
      revalidatePath(`/schools/${itemId}`);
      revalidatePath(`/scholarships/${itemId}`);
      revalidatePath(`/jobs/${itemId}`);
      revalidatePath("/student-portal/saved");
      return { success: true, isSaved: true };
    }
  } catch (error) {
    console.error("[toggleSaveItem]", error);
    return { success: false, error: "Failed to save item. Please try again." };
  }
}

export async function createApplication(formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();

    const studentId = formData.get("studentId") as string;
    const targetId  = formData.get("targetId") as string;
    const targetType = formData.get("targetType") as string;
    const notes = ((formData.get("notes") as string) ?? "").slice(0, 1000);

    if (!studentId || !targetId || !targetType)
      return { success: false, error: "Missing required application fields." };

    const documents = formData.getAll("documents") as File[];
    const documentUrls: string[] = [];
    const endpoint  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    // Validate and upload documents (stored in private docs bucket)
    for (const file of documents) {
      if (!file || file.size === 0) continue;

      const err = validateFile(file, ALLOWED_DOC_TYPES, MAX_DOC_SIZE);
      if (err) return { success: false, error: `Document "${file.name}": ${err}` };

      const buffer = Buffer.from(await file.arrayBuffer());
      const inputFile = InputFile.fromBuffer(buffer, file.name);
      const uploadedFile = await storage.createFile(DOCS_BUCKET, ID.unique(), inputFile);
      documentUrls.push(
        `${endpoint}/storage/buckets/${DOCS_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`
      );
    }

    await databases.createDocument(DATABASE_ID, "Applications", ID.unique(), {
      studentId,
      targetId,
      targetType,
      status: "pending",
      appliedAt: new Date().toISOString(),
      notes,
      documentUrls,
    });

    revalidatePath("/student-portal/applications");
    return { success: true };
  } catch (error) {
    console.error("[createApplication]", error);
    return { success: false, error: "Failed to submit application. Please try again." };
  }
}
