"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const STUDENTS_COLLECTION = "Students";
const SAVED_ITEMS_COLLECTION = "Saved_Items";
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "avatars";

export async function updateStudentProfile(documentId: string, formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();
    
    let avatarUrl = formData.get("currentAvatarUrl") as string | undefined;
    const avatarFile = formData.get("avatarFile") as File | null;
    
    // 1. Upload Avatar if new file is provided
    if (avatarFile && avatarFile.size > 0 && STORAGE_BUCKET) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const inputFile = InputFile.fromBuffer(buffer, avatarFile.name);
      
      const fileId = ID.unique();
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET,
        fileId,
        inputFile
      );
      
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${STORAGE_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`;
    }

    // 2. Parse Data
    const updateData = {
      fullName: formData.get("fullName") as string,
      nationality: formData.get("nationality") as string,
      highestEducation: formData.get("highestEducation") as string,
      englishLevel: formData.get("englishLevel") as string,
      chineseLevel: formData.get("chineseLevel") as string,
      gpa: formData.get("gpa") as string,
      targetDegree: formData.get("targetDegree") as string,
      targetCityTaiwan: formData.get("targetCityTaiwan") as string,
      hasPassport: formData.get("hasPassport") === "true",
      workPermitStatus: formData.get("workPermitStatus") as string,
      vietnameseId: formData.get("vietnameseId") as string,
      ...(avatarUrl && { avatarUrl }),
    };

    // 3. Update Database
    await databases.updateDocument(
      DATABASE_ID,
      STUDENTS_COLLECTION,
      documentId,
      updateData
    );

    revalidatePath("/student-portal/profile");
    revalidatePath("/student-portal");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleSaveItem(studentId: string, itemId: string, itemType: "school" | "scholarship" | "job") {
  try {
    const { databases } = await createSessionClient();
    
    // Check if it's already saved
    const existing = await databases.listDocuments(
      DATABASE_ID,
      SAVED_ITEMS_COLLECTION,
      [
        Query.equal("studentId", studentId),
        Query.equal("itemId", itemId),
        Query.limit(1)
      ]
    );

    if (existing.documents.length > 0) {
      // Unsave
      await databases.deleteDocument(
        DATABASE_ID,
        SAVED_ITEMS_COLLECTION,
        existing.documents[0].$id
      );
      revalidatePath(`/schools/${itemId}`);
      revalidatePath(`/scholarships/${itemId}`);
      revalidatePath(`/jobs/${itemId}`);
      revalidatePath("/student-portal/saved");
      return { success: true, isSaved: false };
    } else {
      // Save
      await databases.createDocument(
        DATABASE_ID,
        SAVED_ITEMS_COLLECTION,
        ID.unique(),
        {
          studentId,
          itemId,
          itemType,
          savedAt: new Date().toISOString()
        }
      );
      revalidatePath(`/schools/${itemId}`);
      revalidatePath(`/scholarships/${itemId}`);
      revalidatePath(`/jobs/${itemId}`);
      revalidatePath("/student-portal/saved");
      return { success: true, isSaved: true };
    }
  } catch (error: any) {
    console.error("Error toggling saved item:", error);
    return { success: false, error: error.message };
  }
}

export async function createApplication(formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();
    
    const studentId = formData.get("studentId") as string;
    const targetId = formData.get("targetId") as string;
    const targetType = formData.get("targetType") as string;
    const notes = formData.get("notes") as string;
    
    const documents = formData.getAll("documents") as File[];
    const documentUrls: string[] = [];

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    // Upload files if any
    for (const file of documents) {
      if (file && file.size > 0 && STORAGE_BUCKET) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const inputFile = InputFile.fromBuffer(buffer, file.name);
        
        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET,
          ID.unique(),
          inputFile
        );
        
        documentUrls.push(`${endpoint}/storage/buckets/${STORAGE_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`);
      }
    }

    // Create Application
    const APPLICATION_COLLECTION = "Applications";
    await databases.createDocument(
      DATABASE_ID,
      APPLICATION_COLLECTION,
      ID.unique(),
      {
        studentId,
        targetId,
        targetType,
        status: "pending",
        appliedAt: new Date().toISOString(),
        notes,
        documentUrls
      }
    );

    revalidatePath("/student-portal/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating application:", error);
    return { success: false, error: error.message };
  }
}
