"use server";

import { createAdminClient, createSessionClient } from "../server";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { deleteOldFile } from "@/lib/appwrite/storage-utils";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const MEDIA_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MEDIA_ID || "unilink_media";
const BUSINESS_COLLECTION_ID = "Businesses";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface JobData {
  businessId?: string;
  title: string;
  location: string;
  salary?: number | string;
  hoursPerWeek?: number | string;
  description?: string;
  allowsStudentVisa?: boolean;
  chineseRequired?: boolean;
  isActive?: boolean;
}

export async function updateBusinessProfile(formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();

    const businessId = formData.get("businessId") as string;
    if (!businessId) return { success: false, error: "Business ID is required." };

    const companyName  = (formData.get("companyName") as string)?.trim();
    const industry     = (formData.get("industry") as string)?.trim();
    const city         = (formData.get("city") as string)?.trim();
    const website      = (formData.get("website") as string)?.trim();
    const contactEmail = (formData.get("contactEmail") as string)?.trim();
    const description  = (formData.get("description") as string)?.trim();
    const logoFile     = formData.get("logo") as File;

    // Validate inputs
    if (!companyName || companyName.length > 200)
      return { success: false, error: "Business name must be 1–200 characters." };
    if (description && description.length > 2000)
      return { success: false, error: "Description too long (max 2000 characters)." };
    if (website && !/^https?:\/\/.+/.test(website))
      return { success: false, error: "Website must be a valid URL." };
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
      return { success: false, error: "Invalid contact email." };

    const existingLogoUrl = formData.get("existingLogoUrl") as string;
    let logoUrl = existingLogoUrl;

    // Validate, upload new logo, delete old one atomically
    if (logoFile && logoFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type))
        return { success: false, error: "Invalid logo type. Only JPEG, PNG, WebP allowed." };
      if (logoFile.size > MAX_IMAGE_SIZE)
        return { success: false, error: "Logo too large. Maximum 5MB." };

      const uploadedFile = await storage.createFile(MEDIA_BUCKET, ID.unique(), logoFile);
      logoUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${MEDIA_BUCKET}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      // Delete old logo after new one is safely uploaded
      await deleteOldFile(storage, existingLogoUrl, MEDIA_BUCKET);
    }

    await databases.updateDocument(DATABASE_ID, BUSINESS_COLLECTION_ID, businessId, {
      companyName, industry, city, website, contactEmail, description, logoUrl,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[updateBusinessProfile]", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

export async function createJob(data: JobData) {
  try {
    const { databases } = await createSessionClient();

    const { businessId, title, location, salary, hoursPerWeek, description, allowsStudentVisa, chineseRequired, isActive } = data;

    if (!title || title.length > 200)
      return { success: false, error: "Job title must be 1–200 characters." };
    if (description && description.length > 3000)
      return { success: false, error: "Description too long (max 3000 characters)." };

    await databases.createDocument(DATABASE_ID, "Jobs", ID.unique(), {
      businessId,
      title: title.trim(),
      location: location?.trim(),
      salary,
      hoursPerWeek: Number(hoursPerWeek) || undefined,
      description: description?.trim(),
      allowsStudentVisa: !!allowsStudentVisa,
      chineseRequired: !!chineseRequired,
      isActive: !!isActive,
    });

    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error) {
    console.error("[createJob]", error);
    return { success: false, error: "Failed to create job. Please try again." };
  }
}

export async function updateJob(jobId: string, data: JobData) {
  try {
    const { databases } = await createSessionClient();

    const { title, location, salary, hoursPerWeek, description, allowsStudentVisa, chineseRequired, isActive } = data;

    if (!title || title.length > 200)
      return { success: false, error: "Job title must be 1–200 characters." };
    if (description && description.length > 3000)
      return { success: false, error: "Description too long (max 3000 characters)." };

    await databases.updateDocument(DATABASE_ID, "Jobs", jobId, {
      title: title.trim(),
      location: location?.trim(),
      salary,
      hoursPerWeek: Number(hoursPerWeek) || undefined,
      description: description?.trim(),
      allowsStudentVisa: !!allowsStudentVisa,
      chineseRequired: !!chineseRequired,
      isActive: !!isActive,
    });

    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error) {
    console.error("[updateJob]", error);
    return { success: false, error: "Failed to update job. Please try again." };
  }
}

export async function deleteJob(jobId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Jobs", jobId);
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error) {
    console.error("[deleteJob]", error);
    return { success: false, error: "Failed to delete job. Please try again." };
  }
}

export async function toggleJobStatus(jobId: string, currentStatus: boolean) {
  try {
    const { databases } = await createSessionClient();
    await databases.updateDocument(DATABASE_ID, "Jobs", jobId, { isActive: !currentStatus });
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error) {
    console.error("[toggleJobStatus]", error);
    return { success: false, error: "Failed to update job status. Please try again." };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, reviewNote: string) {
  try {
    const { databases } = await createSessionClient();

    const allowedStatuses = ["pending", "reviewing", "accepted", "rejected"];
    if (!allowedStatuses.includes(status))
      return { success: false, error: "Invalid status." };

    await databases.updateDocument(DATABASE_ID, "Applications", applicationId, {
      status,
      reviewNote: reviewNote?.slice(0, 500),
    });

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    console.error("[updateApplicationStatus]", error);
    return { success: false, error: "Failed to update application. Please try again." };
  }
}
