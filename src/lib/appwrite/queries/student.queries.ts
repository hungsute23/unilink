import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { Student, SavedItem } from "@/types/appwrite.types";

export async function getStudentProfile(accountId: string): Promise<Student | null> {
  try {
    const { databases } = await createAdminClient();
    
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Students",
      [
        Query.equal("accountId", accountId),
        Query.limit(1)
      ]
    );

    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as Student;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return null;
  }
}

export async function getStudentsByIds(ids: string[]) {
  try {
    if (ids.length === 0) return [];
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Students",
      [
        Query.equal("$id", ids)
      ]
    );
    return response.documents as unknown as Student[];
  } catch (error) {
    console.error("Error fetching multiple student profiles:", error);
    return [];
  }
}

export async function checkIsSaved(studentId: string, itemId: string): Promise<SavedItem | null> {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Saved_Items",
      [
        Query.equal("studentId", studentId),
        Query.equal("itemId", itemId),
        Query.limit(1)
      ]
    );
    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as SavedItem;
  } catch (error) {
    return null;
  }
}

export async function getSavedItems(studentId: string): Promise<SavedItem[]> {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Saved_Items",
      [
        Query.equal("studentId", studentId),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents as unknown as SavedItem[];
  } catch (error) {
    console.error("Error fetching saved items:", error);
    return [];
  }
}

export async function getStudentApplications(studentId: string) {
  try {
    // We use Admin Client because the student might not have permission 
    // to list all documents in the Applications collection if row-level 
    // security is tight. We ensure studentId is verified in the page.
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Applications",
      [
        Query.equal("studentId", studentId),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}
