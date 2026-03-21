"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";
import { deleteOldFile } from "@/lib/appwrite/storage-utils";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const SCHOOLS_COLLECTION = "Schools";
const MEDIA_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MEDIA_ID || "unilink_media";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return "Invalid file type. Only JPEG, PNG, WebP allowed.";
  if (file.size > MAX_IMAGE_SIZE)
    return "File too large. Maximum 5MB.";
  return null;
}

export async function updateSchoolProfile(documentId: string, formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();

    const currentLogoUrl = formData.get("currentLogoUrl") as string | undefined;
    let logoUrl = currentLogoUrl;
    const logoFile = formData.get("logoFile") as File | null;

    // 1. Validate, upload new logo, delete old one atomically
    if (logoFile && logoFile.size > 0) {
      const err = validateImageFile(logoFile);
      if (err) return { success: false, error: err };

      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const inputFile = InputFile.fromBuffer(buffer, logoFile.name);
      const uploadedFile = await storage.createFile(MEDIA_BUCKET, ID.unique(), inputFile);

      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      logoUrl = `${endpoint}/storage/buckets/${MEDIA_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`;

      // Delete old logo after new one is safely uploaded
      await deleteOldFile(storage, currentLogoUrl, MEDIA_BUCKET);
    }

    // 2. Validate inputs
    const schoolName = (formData.get("schoolName") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const website = (formData.get("website") as string)?.trim();
    const contactEmail = (formData.get("contactEmail") as string)?.trim();

    if (!schoolName || schoolName.length > 200)
      return { success: false, error: "School name must be 1–200 characters." };
    if (description && description.length > 2000)
      return { success: false, error: "Description too long (max 2000 characters)." };
    if (website && !/^https?:\/\/.+/.test(website))
      return { success: false, error: "Website must be a valid URL." };
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
      return { success: false, error: "Invalid contact email." };

    // 3. Update database
    await databases.updateDocument(DATABASE_ID, SCHOOLS_COLLECTION, documentId, {
      schoolName,
      city: (formData.get("city") as string)?.trim(),
      website,
      contactEmail,
      description,
      ranking: (formData.get("ranking") as string)?.trim(),
      hasDorm: formData.get("hasDorm") === "true",
      ...(logoUrl && { logoUrl }),
    });

    revalidatePath("/school-portal");
    revalidatePath("/schools");
    revalidatePath(`/schools/${documentId}`);
    return { success: true };
  } catch (error) {
    console.error("[updateSchoolProfile]", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

export async function createAdmissionTerm(formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const schoolId = formData.get("schoolId") as string;
    if (!schoolId) return { success: false, error: "School ID is required." };

    await databases.createDocument(DATABASE_ID, "Admission_Terms", ID.unique(), {
      schoolId,
      termName: (formData.get("termName") as string)?.trim(),
      applyStartDate: formData.get("applyStartDate") as string,
      applyEndDate: formData.get("applyEndDate") as string,
      startDate: formData.get("startDate") as string,
      tuitionFee: Number(formData.get("tuitionFee")) || 0,
      requirements: formData.get("requirements") as string,
      isActive: formData.get("isActive") === "true",
    });

    revalidatePath("/school-portal/terms");
    return { success: true };
  } catch (error) {
    console.error("[createAdmissionTerm]", error);
    return { success: false, error: "Failed to create term. Please try again." };
  }
}

export async function updateAdmissionTerm(termId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    await databases.updateDocument(DATABASE_ID, "Admission_Terms", termId, {
      termName: (formData.get("termName") as string)?.trim(),
      applyStartDate: formData.get("applyStartDate") as string,
      applyEndDate: formData.get("applyEndDate") as string,
      startDate: formData.get("startDate") as string,
      tuitionFee: Number(formData.get("tuitionFee")) || 0,
      requirements: formData.get("requirements") as string,
      isActive: formData.get("isActive") === "true",
    });

    revalidatePath("/school-portal/terms");
    return { success: true };
  } catch (error) {
    console.error("[updateAdmissionTerm]", error);
    return { success: false, error: "Failed to update term. Please try again." };
  }
}

export async function deleteAdmissionTerm(termId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Admission_Terms", termId);
    revalidatePath("/school-portal/terms");
    return { success: true };
  } catch (error) {
    console.error("[deleteAdmissionTerm]", error);
    return { success: false, error: "Failed to delete term. Please try again." };
  }
}

export async function createProgram(formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    await databases.createDocument(DATABASE_ID, "Programs", ID.unique(), {
      termId: formData.get("termId") as string,
      departmentName: (formData.get("departmentName") as string)?.trim(),
      degreeLevel: formData.get("degreeLevel") as string,
      language: formData.get("language") as string,
      durationYears: Number(formData.get("durationYears")) || 4,
      availableSlots: Number(formData.get("availableSlots")) || 0,
    });

    revalidatePath("/school-portal/programs");
    return { success: true };
  } catch (error) {
    console.error("[createProgram]", error);
    return { success: false, error: "Failed to create program. Please try again." };
  }
}

export async function updateProgram(programId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    const scholarshipIds = ((formData.get("scholarshipIds") as string) || "").split(",").filter(id => !!id.trim());
    const requiredDocs   = ((formData.get("requiredDocs")    as string) || "").split("\n").filter(d => !!d.trim());

    await databases.updateDocument(DATABASE_ID, "Programs", programId, {
      termId:              formData.get("termId") as string,
      departmentName:      (formData.get("departmentName") as string)?.trim(),
      degreeLevel:         formData.get("degreeLevel") as string,
      languageInstruction: formData.get("languageInstruction") as string,
      tuitionFee:          formData.get("tuitionFee") as string,
      minEnglishReq:       formData.get("minEnglishReq") as string,
      minChineseReq:       formData.get("minChineseReq") as string,
      applicationFee:      formData.get("applicationFee") as string,
      programUrl:          formData.get("programUrl") as string,
      scholarshipIds,
      requiredDocs,
    });

    revalidatePath("/school-portal/programs");
    revalidatePath("/schools");
    return { success: true };
  } catch (error) {
    console.error("[updateProgram]", error);
    return { success: false, error: "Failed to update program. Please try again." };
  }
}

export async function deleteProgram(programId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Programs", programId);
    revalidatePath("/school-portal/programs");
    revalidatePath("/schools");
    return { success: true };
  } catch (error) {
    console.error("[deleteProgram]", error);
    return { success: false, error: "Failed to delete program. Please try again." };
  }
}

export async function createScholarship(formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length > 200)
      return { success: false, error: "Scholarship name must be 1–200 characters." };

    await databases.createDocument(DATABASE_ID, "Scholarships", ID.unique(), {
      schoolId:     formData.get("schoolId") as string,
      name,
      source:       formData.get("source") as string,
      amount:       formData.get("amount") as string,
      duration:     formData.get("duration") as string,
      coversTuition: formData.get("coversTuition") === "true",
      coversDorm:    formData.get("coversDorm")    === "true",
      coversStipend: formData.get("coversStipend") === "true",
      minGpa:        formData.get("minGpa") as string,
      minEnglishReq: formData.get("minEnglishReq") as string,
      minChineseReq: formData.get("minChineseReq") as string,
      deadline:      formData.get("deadline") as string,
      requirements:  (formData.get("requirements") as string)?.slice(0, 2000),
      isActive: true,
    });

    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    return { success: true };
  } catch (error) {
    console.error("[createScholarship]", error);
    return { success: false, error: "Failed to create scholarship. Please try again." };
  }
}

export async function updateScholarship(scholarshipId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length > 200)
      return { success: false, error: "Scholarship name must be 1–200 characters." };

    await databases.updateDocument(DATABASE_ID, "Scholarships", scholarshipId, {
      name,
      amount:        formData.get("amount") as string,
      duration:      formData.get("duration") as string,
      coversTuition: formData.get("coversTuition") === "true",
      coversDorm:    formData.get("coversDorm")    === "true",
      coversStipend: formData.get("coversStipend") === "true",
      minGpa:        formData.get("minGpa") as string,
      minEnglishReq: formData.get("minEnglishReq") as string,
      minChineseReq: formData.get("minChineseReq") as string,
      deadline:      formData.get("deadline") as string,
      requirements:  (formData.get("requirements") as string)?.slice(0, 2000),
      isActive:      formData.get("isActive") === "true",
    });

    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    revalidatePath(`/scholarships/${scholarshipId}`);
    return { success: true };
  } catch (error) {
    console.error("[updateScholarship]", error);
    return { success: false, error: "Failed to update scholarship. Please try again." };
  }
}

export async function deleteScholarship(scholarshipId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Scholarships", scholarshipId);
    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    return { success: true };
  } catch (error) {
    console.error("[deleteScholarship]", error);
    return { success: false, error: "Failed to delete scholarship. Please try again." };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, reviewNote?: string) {
  try {
    const { databases } = await createSessionClient();

    const allowedStatuses = ["pending", "reviewing", "accepted", "rejected"];
    if (!allowedStatuses.includes(status))
      return { success: false, error: "Invalid status." };

    await databases.updateDocument(DATABASE_ID, "Applications", applicationId, {
      status,
      ...(reviewNote !== undefined && { reviewNote: reviewNote.slice(0, 500) }),
    });

    revalidatePath("/school-portal/applications");
    return { success: true };
  } catch (error) {
    console.error("[updateApplicationStatus]", error);
    return { success: false, error: "Failed to update application. Please try again." };
  }
}
