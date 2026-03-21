"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

interface ScholarshipData {
  name: string;
  description?: string;
  amount?: number | string;
  deadline?: string;
  source?: string;
  coversTuition?: boolean;
  coversStipend?: boolean;
  coversDorm?: boolean;
  isActive?: boolean;
  schoolId?: string;
}

export async function getPlatformStats() {
  try {
    const { users, databases } = await createAdminClient();

    const [usersList, schoolsList, scholarshipsList, jobsList, applicationsList] = await Promise.all([
      users.list([Query.limit(1)]),
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
      },
    };
  } catch (error) {
    console.error("[getPlatformStats]", error);
    return { success: false, error: "Failed to fetch platform stats." };
  }
}

export async function getAllUsers(limit = 25, offset = 0, search?: string) {
  try {
    const { users } = await createAdminClient();
    const queries = [Query.limit(limit), Query.offset(offset)];

    if (search) {
      // Sanitize: trim + cap length to prevent oversized queries
      const sanitized = search.trim().slice(0, 100);
      if (sanitized) queries.push(Query.search("name", sanitized));
    }

    const response = await users.list(queries);
    return { success: true, users: response.users, total: response.total };
  } catch (error) {
    console.error("[getAllUsers]", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

export async function toggleUserStatus(userId: string, shouldBan: boolean) {
  try {
    const { users } = await createAdminClient();
    await users.updateStatus(userId, !shouldBan);
    return { success: true };
  } catch (error) {
    console.error("[toggleUserStatus]", error);
    return { success: false, error: "Failed to update user status." };
  }
}

export async function getPartners(
  collectionName: "Schools" | "Businesses",
  limit = 50,
  offset = 0,
  search?: string,
  status?: "all" | "approved" | "pending"
) {
  try {
    const { databases } = await createAdminClient();
    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")];
    if (search) {
      const s = search.trim().slice(0, 100);
      const nameField = collectionName === "Schools" ? "schoolName" : "companyName";
      if (s) queries.push(Query.search(nameField, s));
    }
    if (status === "approved") queries.push(Query.equal("isApproved", true));
    if (status === "pending")  queries.push(Query.equal("isApproved", false));
    const response = await databases.listDocuments(DB_ID, collectionName, queries);
    return { success: true, documents: response.documents, total: response.total };
  } catch (error) {
    console.error(`[getPartners:${collectionName}]`, error);
    return { success: false, error: "Failed to fetch partners." };
  }
}

export async function updatePartnerStatus(
  collectionName: "Schools" | "Businesses",
  docId: string,
  isApproved: boolean
) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB_ID, collectionName, docId, { isApproved });
    return { success: true };
  } catch (error) {
    console.error(`[updatePartnerStatus:${docId}]`, error);
    return { success: false, error: "Failed to update partner status." };
  }
}

export async function getGlobalScholarships(limit = 50, offset = 0, search?: string) {
  try {
    const { databases } = await createAdminClient();
    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")];
    if (search) {
      const s = search.trim().slice(0, 100);
      if (s) queries.push(Query.search("name", s));
    }
    const response = await databases.listDocuments(DB_ID, "Scholarships", queries);
    return { success: true, documents: response.documents, total: response.total };
  } catch (error) {
    console.error("[getGlobalScholarships]", error);
    return { success: false, error: "Failed to fetch scholarships." };
  }
}

export async function createGlobalScholarship(data: ScholarshipData) {
  try {
    const { databases } = await createAdminClient();

    if (!data.name || data.name.trim().length === 0)
      return { success: false, error: "Scholarship name is required." };
    if (data.name.length > 200)
      return { success: false, error: "Scholarship name too long (max 200 characters)." };

    const doc = await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
      ...data,
      name: data.name.trim(),
      isApproved: true,
    });
    return { success: true, document: doc };
  } catch (error) {
    console.error("[createGlobalScholarship]", error);
    return { success: false, error: "Failed to create scholarship." };
  }
}

export async function getSystemConfigs() {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(DB_ID, "System_Configs");
    return { success: true, configs: response.documents };
  } catch (error) {
    console.error("[getSystemConfigs]", error);
    return { success: false, error: "Failed to fetch system configs." };
  }
}

export async function updateSystemConfig(configId: string, value: string) {
  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB_ID, "System_Configs", configId, {
      value: value.slice(0, 1000),
    });
    return { success: true };
  } catch (error) {
    console.error("[updateSystemConfig]", error);
    return { success: false, error: "Failed to update config." };
  }
}
