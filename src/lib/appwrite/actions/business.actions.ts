"use server";

import { createAdminClient, createSessionClient } from "../server";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
const BUSINESS_COLLECTION_ID = "Businesses";

export async function updateBusinessProfile(formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();
    
    const businessId = formData.get("businessId") as string;
    const name = formData.get("name") as string;
    const industry = formData.get("industry") as string;
    const city = formData.get("city") as string;
    const website = formData.get("website") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const description = formData.get("description") as string;
    const logoFile = formData.get("logo") as File;

    let logoUrl = formData.get("existingLogoUrl") as string;

    if (logoFile && logoFile.size > 0) {
      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        logoFile
      );
      logoUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    }

    await databases.updateDocument(
      DATABASE_ID,
      BUSINESS_COLLECTION_ID,
      businessId,
      {
        name,
        industry,
        city,
        website,
        contactEmail,
        description,
        logoUrl,
      }
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating business profile:", error);
    return { success: false, error: error.message };
  }
}

export async function createJob(data: any) {
  try {
    const { databases } = await createSessionClient();
    
    const { 
      businessId, 
      title, 
      location, 
      salary, 
      hoursPerWeek, 
      description, 
      allowsStudentVisa, 
      chineseRequired, 
      isActive 
    } = data;

    await databases.createDocument(
      DATABASE_ID,
      "Jobs",
      ID.unique(),
      {
        businessId,
        title,
        location,
        salary,
        hoursPerWeek: Number(hoursPerWeek),
        description,
        allowsStudentVisa: !!allowsStudentVisa,
        chineseRequired: !!chineseRequired,
        isActive: !!isActive,
      }
    );

    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating job:", error);
    return { success: false, error: error.message };
  }
}

export async function updateJob(jobId: string, data: any) {
  try {
    const { databases } = await createSessionClient();
    
    const { 
      title, 
      location, 
      salary, 
      hoursPerWeek, 
      description, 
      allowsStudentVisa, 
      chineseRequired, 
      isActive 
    } = data;

    await databases.updateDocument(
      DATABASE_ID,
      "Jobs",
      jobId,
      {
        title,
        location,
        salary,
        hoursPerWeek: Number(hoursPerWeek),
        description,
        allowsStudentVisa: !!allowsStudentVisa,
        chineseRequired: !!chineseRequired,
        isActive: !!isActive,
      }
    );

    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating job:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteJob(jobId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Jobs", jobId);
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleJobStatus(jobId: string, currentStatus: boolean) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(
      DATABASE_ID, 
      "Jobs", 
      jobId, 
      { isActive: !currentStatus }
    );
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling job status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, reviewNote: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(
      DATABASE_ID,
      "Applications",
      applicationId,
      {
        status,
        reviewNote,
      }
    );
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
}
