import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { School, Program, Scholarship } from "@/types/appwrite.types";

export async function getSchoolProfile(ownerId: string): Promise<School | null> {
  try {
    const { databases } = await createSessionClient();
    
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Schools",
      [
        Query.equal("ownerId", ownerId),
        Query.limit(1)
      ]
    );

    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as School;
  } catch (error) {
    console.error("Error fetching school profile:", error);
    return null;
  }
}

export async function getAdmissionTerms(schoolId: string) {
  try {
    const { databases } = await createSessionClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Admission_Terms",
      [
        Query.equal("schoolId", schoolId),
        Query.orderDesc("applyStartDate")
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching admission terms:", error);
    return [];
  }
}

export async function getSchoolPrograms(schoolId: string) {
  try {
    const { databases } = await createSessionClient();
    
    // 1. Get all terms for this school
    const terms = await getAdmissionTerms(schoolId);
    if (terms.length === 0) return [];
    
    const termIds = terms.map(t => t.$id);

    // 2. Get programs linked to these terms
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Programs",
      [
        Query.equal("termId", termIds),
        Query.orderAsc("departmentName")
      ]
    );
    return response.documents as unknown as Program[];
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

export async function getSchoolScholarships(schoolId: string) {
  try {
    const { databases } = await createSessionClient();
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Scholarships",
      [
        Query.equal("schoolId", schoolId),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents as unknown as Scholarship[];
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return [];
  }
}

export async function getSchoolApplications(schoolId: string) {
  try {
    // We use Admin Client because the School Admin might not have direct 'read' permission 
    // on Application documents created by students in Appwrite's default document-level security.
    const { databases } = await createAdminClient();
    
    // 1. Get all programs and scholarships for this school
    const [programs, scholarships] = await Promise.all([
      getSchoolPrograms(schoolId),
      getSchoolScholarships(schoolId)
    ]);
    
    // 2. Build list of IDs that students might be applying to
    const targetIds = [
      schoolId, 
      ...programs.map(p => p.$id), 
      ...scholarships.map(s => s.$id)
    ];

    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      "Applications",
      [
        Query.equal("targetId", targetIds),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching school applications:", error);
    return [];
  }
}
