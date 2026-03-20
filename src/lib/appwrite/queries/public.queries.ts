import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { 
  School, 
  Scholarship, 
  Job, 
  Program, 
  AdmissionTerm 
} from "@/types/appwrite.types";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function getFeaturedSchools(limit = 6): Promise<School[]> {
  try {
    const { databases } = await createAdminClient();
    console.log(`[DEBUG] Fetching schools from DB: ${DB_ID}`);
    const response = await databases.listDocuments(DB_ID, "Schools", [
      Query.limit(limit),
      Query.orderDesc("$createdAt"), 
    ]);
    console.log(`[DEBUG] Found ${response.total} schools.`);
    return response.documents as unknown as School[];
  } catch (error) {
    console.error("Error fetching featured schools:", error);
    return [];
  }
}

export async function getFeaturedScholarships(limit = 6): Promise<Scholarship[]> {
  try {
    const { databases } = await createAdminClient();
    console.log(`[DEBUG] Fetching scholarships from DB: ${DB_ID}`);
    const response = await databases.listDocuments(DB_ID, "Scholarships", [
      Query.equal("isActive", true),
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
    ]);
    console.log(`[DEBUG] Found ${response.total} scholarships.`);
    return response.documents as unknown as Scholarship[];
  } catch (error) {
    console.error("Error fetching featured scholarships:", error);
    return [];
  }
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, "Jobs", [
      Query.equal("isActive", true),
      // Query.equal("allowsStudentVisa", true), // For international students
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
    ]);
    return response.documents as unknown as Job[];
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    return [];
  }
}

export async function getAllSchools(filters?: { search?: string; city?: string }): Promise<School[]> {
  try {
    const { databases } = await createAdminClient();
    const queries = [Query.limit(100), Query.orderDesc("$createdAt")];
    if (filters?.city) queries.push(Query.equal("city", filters.city));
    if (filters?.search) queries.push(Query.contains("schoolName", filters.search));
    const response = await databases.listDocuments(DB_ID, "Schools", queries);
    return response.documents as unknown as School[];
  } catch (error) {
    return [];
  }
}

export async function getAllScholarships(filters?: { source?: string }): Promise<Scholarship[]> {
  try {
    const { databases } = await createAdminClient();
    const queries = [Query.equal("isActive", true), Query.limit(100), Query.orderDesc("$createdAt")];
    if (filters?.source) queries.push(Query.equal("source", filters.source));
    const response = await databases.listDocuments(DB_ID, "Scholarships", queries);
    return response.documents as unknown as Scholarship[];
  } catch (error) {
    return [];
  }
}

export async function getAllJobs(filters?: { type?: string; allowsVisa?: boolean }): Promise<Job[]> {
  try {
    const { databases } = await createAdminClient();
    const queries = [Query.equal("isActive", true), Query.limit(100), Query.orderDesc("$createdAt")];
    if (filters?.type) queries.push(Query.equal("jobType", filters.type));
    if (filters?.allowsVisa) queries.push(Query.equal("allowsStudentVisa", true));
    const response = await databases.listDocuments(DB_ID, "Jobs", queries);
    return response.documents as unknown as Job[];
  } catch (error) {
    return [];
  }
}

export async function getStats() {
  try {
    const { databases } = await createAdminClient();
    const [schools, scholarships, jobs] = await Promise.all([
      databases.listDocuments(DB_ID, "Schools", [Query.limit(1)]),
      databases.listDocuments(DB_ID, "Scholarships", [Query.equal("isActive", true), Query.limit(1)]),
      databases.listDocuments(DB_ID, "Jobs", [Query.equal("isActive", true), Query.limit(1)]),
    ]);

    return {
      totalSchools: schools.total || 120,
      totalScholarships: scholarships.total || 450,
      totalJobs: jobs.total || 850,
    };
  } catch (error) {
    return { totalSchools: 120, totalScholarships: 450, totalJobs: 850 };
  }
}

export async function getSchoolAdmissionTerms(schoolId: string): Promise<AdmissionTerm[]> {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, "Admission_Terms", [
      Query.equal("schoolId", schoolId),
      Query.orderDesc("applyStartDate"),
    ]);
    return response.documents as unknown as AdmissionTerm[];
  } catch (error) {
    return [];
  }
}

export async function getSchoolPrograms(schoolId: string): Promise<Program[]> {
  try {
    const { databases } = await createAdminClient();
    
    // Get terms first
    const terms = await getSchoolAdmissionTerms(schoolId);
    if (terms.length === 0) return [];
    
    const termIds = terms.map(t => t.$id);

    const response = await databases.listDocuments(DB_ID, "Programs", [
      Query.equal("termId", termIds),
      Query.orderAsc("departmentName"),
    ]);
    return response.documents as unknown as Program[];
  } catch (error) {
    console.error("Error fetching school programs:", error);
    return [];
  }
}
