"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function getPlatformStats() {
  try {
    const { users, databases } = await createAdminClient();

    // Fetch counts for all major collections
    const [
      usersList,
      schoolsList,
      scholarshipsList,
      jobsList,
      applicationsList
    ] = await Promise.all([
      users.list([Query.limit(1)]), // Total users count
      databases.listDocuments(DB_ID, "Schools", [Query.limit(1)]),
      databases.listDocuments(DB_ID, "Scholarships", [Query.limit(1)]),
      databases.listDocuments(DB_ID, "Jobs", [Query.limit(1)]),
      databases.listDocuments(DB_ID, "Applications", [Query.limit(1)]),
    ]);

    return {
      success: true,
      stats: {
        totalUsers: usersList.total,
        totalSchools: schoolsList.total,
        totalScholarships: scholarshipsList.total,
        totalJobs: jobsList.total,
        totalApplications: applicationsList.total,
      }
    };
  } catch (error: any) {
    console.error("Error fetching platform stats:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllUsers(limit = 25, offset = 0, search?: string) {
  try {
    const { users } = await createAdminClient();
    const queries = [Query.limit(limit), Query.offset(offset)];
    
    if (search) {
      queries.push(Query.search("name", search));
      // Note: Appwrite only supports search on certain attributes.
      // If name doesn't work, we might need a different approach.
    }

    const response = await users.list(queries);
    return {
      success: true,
      users: response.users,
      total: response.total
    };
  } catch (error: any) {
    console.error("Error listing users:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleUserStatus(userId: string, shouldBan: boolean) {
  try {
    const { users } = await createAdminClient();
    await users.updateStatus(userId, !shouldBan); // Appwrite status is boolean 'active'
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { success: false, error: error.message };
  }
}

export async function getPartners(collectionName: "Schools" | "Businesses", limit = 25, offset = 0) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      DB_ID,
      collectionName,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    );
    return {
      success: true,
      documents: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error(`Error fetching ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function updatePartnerStatus(
  collectionName: "Schools" | "Businesses", 
  docId: string, 
  isApproved: boolean
) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(
      DB_ID,
      collectionName,
      docId,
      { isApproved }
    );
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating status for ${docId}:`, error);
    return { success: false, error: error.message };
  }
}

export async function getGlobalScholarships(limit = 25, offset = 0) {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      DB_ID,
      "Scholarships",
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    );
    return {
      success: true,
      documents: response.documents,
      total: response.total
    };
  } catch (error: any) {
    console.error("Error fetching scholarships:", error);
    return { success: false, error: error.message };
  }
}

export async function createGlobalScholarship(data: any) {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.createDocument(
      DB_ID,
      "Scholarships",
      "unique()",
      { ...data, isApproved: true } // Admin created items are auto-approved
    );
    return { success: true, document: doc };
  } catch (error: any) {
    console.error("Error creating scholarship:", error);
    return { success: false, error: error.message };
  }
}

export async function getSystemConfigs() {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, "System_Configs");
    return { success: true, configs: response.documents };
  } catch (error: any) {
    console.error("Error fetching configs:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSystemConfig(configId: string, value: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB_ID, "System_Configs", configId, { value });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating config:", error);
    return { success: false, error: error.message };
  }
}
