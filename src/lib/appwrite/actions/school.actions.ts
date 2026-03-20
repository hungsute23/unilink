"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { revalidatePath } from "next/cache";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const SCHOOLS_COLLECTION = "Schools";
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "avatars"; // Reusing the same bucket for logos or can use separate one

export async function updateSchoolProfile(documentId: string, formData: FormData) {
  try {
    const { databases, storage } = await createSessionClient();
    
    let logoUrl = formData.get("currentLogoUrl") as string | undefined;
    const logoFile = formData.get("logoFile") as File | null;
    
    // 1. Upload Logo if new file is provided
    if (logoFile && logoFile.size > 0 && STORAGE_BUCKET) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const inputFile = InputFile.fromBuffer(buffer, logoFile.name);
      
      const fileId = ID.unique();
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET,
        fileId,
        inputFile
      );
      
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      logoUrl = `${endpoint}/storage/buckets/${STORAGE_BUCKET}/files/${uploadedFile.$id}/view?project=${projectId}`;
    }

    // 2. Parse Data
    const updateData = {
      schoolName: formData.get("schoolName") as string,
      city: formData.get("city") as string,
      website: formData.get("website") as string,
      contactEmail: formData.get("contactEmail") as string,
      description: formData.get("description") as string,
      ranking: formData.get("ranking") as string,
      hasDorm: formData.get("hasDorm") === "true",
      ...(logoUrl && { logoUrl }),
    };

    // 3. Update Database
    await databases.updateDocument(
      DATABASE_ID,
      SCHOOLS_COLLECTION,
      documentId,
      updateData
    );

    revalidatePath("/school-portal");
    revalidatePath("/schools");
    revalidatePath(`/schools/${documentId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating school profile:", error);
    return { success: false, error: error.message };
  }
}

export async function createAdmissionTerm(formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const schoolId = formData.get("schoolId") as string;
    const termName = formData.get("termName") as string;
    const applyStartDate = formData.get("applyStartDate") as string;
    const applyEndDate = formData.get("applyEndDate") as string;
    const intakeMonth = formData.get("intakeMonth") as string;
    const notes = formData.get("notes") as string;

    await databases.createDocument(
      DATABASE_ID,
      "Admission_Terms",
      ID.unique(),
      {
        schoolId,
        termName,
        applyStartDate,
        applyEndDate,
        intakeMonth,
        notes
      }
    );

    revalidatePath("/school-portal/terms");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating admission term:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdmissionTerm(termId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const termName = formData.get("termName") as string;
    const applyStartDate = formData.get("applyStartDate") as string;
    const applyEndDate = formData.get("applyEndDate") as string;
    const intakeMonth = formData.get("intakeMonth") as string;
    const notes = formData.get("notes") as string;

    await databases.updateDocument(
      DATABASE_ID,
      "Admission_Terms",
      termId,
      {
        termName,
        applyStartDate,
        applyEndDate,
        intakeMonth,
        notes
      }
    );

    revalidatePath("/school-portal/terms");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admission term:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdmissionTerm(termId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Admission_Terms", termId);
    
    revalidatePath("/school-portal/terms");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admission term:", error);
    return { success: false, error: error.message };
  }
}

export async function createProgram(formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const schoolId = formData.get("schoolId") as string;
    const termId = formData.get("termId") as string;
    const departmentName = formData.get("departmentName") as string;
    const degreeLevel = formData.get("degreeLevel") as string;
    const languageInstruction = formData.get("languageInstruction") as string;
    const tuitionFee = formData.get("tuitionFee") as string;
    const minEnglishReq = formData.get("minEnglishReq") as string;
    const minChineseReq = formData.get("minChineseReq") as string;
    const applicationFee = formData.get("applicationFee") as string;
    const programUrl = formData.get("programUrl") as string;
    
    // Parse array fields
    const scholarshipIds = (formData.get("scholarshipIds") as string || "").split(",").filter(id => !!id.trim());
    const requiredDocs = (formData.get("requiredDocs") as string || "").split("\n").filter(doc => !!doc.trim());

    await databases.createDocument(
      DATABASE_ID,
      "Programs",
      ID.unique(),
      {
        termId,
        departmentName,
        degreeLevel,
        languageInstruction,
        tuitionFee,
        minEnglishReq,
        minChineseReq,
        applicationFee,
        programUrl,
        scholarshipIds,
        requiredDocs
      }
    );

    revalidatePath("/school-portal/programs");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating program:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProgram(programId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const termId = formData.get("termId") as string;
    const departmentName = formData.get("departmentName") as string;
    const degreeLevel = formData.get("degreeLevel") as string;
    const languageInstruction = formData.get("languageInstruction") as string;
    const tuitionFee = formData.get("tuitionFee") as string;
    const minEnglishReq = formData.get("minEnglishReq") as string;
    const minChineseReq = formData.get("minChineseReq") as string;
    const applicationFee = formData.get("applicationFee") as string;
    const programUrl = formData.get("programUrl") as string;

    const scholarshipIds = (formData.get("scholarshipIds") as string || "").split(",").filter(id => !!id.trim());
    const requiredDocs = (formData.get("requiredDocs") as string || "").split("\n").filter(doc => !!doc.trim());

    await databases.updateDocument(
      DATABASE_ID,
      "Programs",
      programId,
      {
        termId,
        departmentName,
        degreeLevel,
        languageInstruction,
        tuitionFee,
        minEnglishReq,
        minChineseReq,
        applicationFee,
        programUrl,
        scholarshipIds,
        requiredDocs
      }
    );

    revalidatePath("/school-portal/programs");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating program:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProgram(programId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Programs", programId);
    
    revalidatePath("/school-portal/programs");
    revalidatePath("/schools");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting program:", error);
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, reviewNote?: string) {
  try {
    const { databases } = await createSessionClient();
    
    await databases.updateDocument(
      DATABASE_ID,
      "Applications",
      applicationId,
      {
        status,
        reviewNote
      }
    );

    revalidatePath("/school-portal/applications");
    revalidatePath("/student-portal/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
}

export async function createScholarship(formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const schoolId = formData.get("schoolId") as string;
    const name = formData.get("name") as string;
    const source = formData.get("source") as string;
    const amount = formData.get("amount") as string;
    const duration = formData.get("duration") as string;
    const coversTuition = formData.get("coversTuition") === "true";
    const coversDorm = formData.get("coversDorm") === "true";
    const coversStipend = formData.get("coversStipend") === "true";
    const minGpa = formData.get("minGpa") as string;
    const minEnglishReq = formData.get("minEnglishReq") as string;
    const minChineseReq = formData.get("minChineseReq") as string;
    const deadline = formData.get("deadline") as string;
    const requirements = formData.get("requirements") as string;

    await databases.createDocument(
      DATABASE_ID,
      "Scholarships",
      ID.unique(),
      {
        schoolId,
        name,
        source,
        amount,
        duration,
        coversTuition,
        coversDorm,
        coversStipend,
        minGpa,
        minEnglishReq,
        minChineseReq,
        deadline,
        requirements,
        isActive: true
      }
    );

    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating scholarship:", error);
    return { success: false, error: error.message };
  }
}

export async function updateScholarship(scholarshipId: string, formData: FormData) {
  try {
    const { databases } = await createSessionClient();
    
    const name = formData.get("name") as string;
    const amount = formData.get("amount") as string;
    const duration = formData.get("duration") as string;
    const coversTuition = formData.get("coversTuition") === "true";
    const coversDorm = formData.get("coversDorm") === "true";
    const coversStipend = formData.get("coversStipend") === "true";
    const minGpa = formData.get("minGpa") as string;
    const minEnglishReq = formData.get("minEnglishReq") as string;
    const minChineseReq = formData.get("minChineseReq") as string;
    const deadline = formData.get("deadline") as string;
    const requirements = formData.get("requirements") as string;
    const isActive = formData.get("isActive") === "true";

    await databases.updateDocument(
      DATABASE_ID,
      "Scholarships",
      scholarshipId,
      {
        name,
        amount,
        duration,
        coversTuition,
        coversDorm,
        coversStipend,
        minGpa,
        minEnglishReq,
        minChineseReq,
        deadline,
        requirements,
        isActive
      }
    );

    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    revalidatePath(`/scholarships/${scholarshipId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating scholarship:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteScholarship(scholarshipId: string) {
  try {
    const { databases } = await createSessionClient();
    await databases.deleteDocument(DATABASE_ID, "Scholarships", scholarshipId);
    
    revalidatePath("/school-portal/scholarships");
    revalidatePath("/scholarships");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting scholarship:", error);
    return { success: false, error: error.message };
  }
}



