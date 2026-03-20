import { createSessionClient, createAdminClient } from "../server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const BUSINESS_COLLECTION_ID = "Businesses";

export async function getBusinessProfile(ownerId: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      BUSINESS_COLLECTION_ID,
      [Query.equal("ownerId", ownerId)]
    );
    return response.documents[0] || null;
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}
export async function getBusinessJobs(businessId: string) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      DATABASE_ID,
      "Jobs",
      [
        Query.equal("businessId", businessId),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching business jobs:", error);
    return [];
  }
}
export async function getBusinessApplications(businessId: string) {
  try {
    const { databases } = await createAdminClient();
    
    // First, get all job IDs for this business
    const jobs = await getBusinessJobs(businessId);
    const jobIds = jobs.map(j => j.$id);
    
    if (jobIds.length === 0) return [];

    const response = await databases.listDocuments(
      DATABASE_ID,
      "Applications",
      [
        Query.equal("jobId", jobIds),
        Query.orderDesc("$createdAt")
      ]
    );

    // We'll need to fetch student profiles for these applications
    // In a real scenario, we might use relationships or a manual join
    const studentIds = [...new Set(response.documents.map(a => a.studentId))];
    const studentsResponse = await databases.listDocuments(
      DATABASE_ID,
      "Students",
      [Query.equal("$id", studentIds)]
    );
    
    const studentsMap = new Map(studentsResponse.documents.map(s => [s.$id, s]));

    // Enrich applications with student and job data
    return response.documents.map(app => ({
      ...app,
      student: studentsMap.get(app.studentId),
      job: jobs.find(j => j.$id === app.jobId)
    }));
  } catch (error) {
    console.error("Error fetching business applications:", error);
    return [];
  }
}
