"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";
import { UserRole } from "@/types/appwrite.types";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function loginWithEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!email || !password) {
      return { error: "Vui lòng nhập email và mật khẩu." };
    }

    const { account, users } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set(`a_session_${PROJECT_ID}`, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(session.expire),
    });

    // Get user to return role for redirection using users service (admin)
    const user = await users.get(session.userId);
    const role = (user.prefs as any)?.role || "student";

    // For school/business, check if approved
    let pending = false;
    if (role === "school" || role === "business") {
      const { databases } = await createAdminClient();
      const collection = role === "school" ? "Schools" : "Businesses";
      const field = role === "school" ? "ownerId" : "ownerId";
      const { Query } = await import("node-appwrite");
      const docs = await databases.listDocuments(DB_ID, collection, [Query.equal(field, session.userId), Query.limit(1)]);
      const profile = docs.documents[0];
      pending = !profile || profile.isApproved === false;
    }

    return { success: true, role, pending };
  } catch (error) {
    console.error("[loginWithEmail]", error);
    return { error: "Email hoặc mật khẩu không đúng." };
  }
}

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as UserRole;
    
    if (!email || !password || !fullName || !role) {
      return { error: "Vui lòng điền đầy đủ thông tin." };
    }

    const { account, databases, users } = await createAdminClient();
    
    // 1. Create Appwrite Account
    const userAccount = await account.create(ID.unique(), email, password, fullName);

    // 2. Set preferences to store the role
    await users.updatePrefs(userAccount.$id, { role });

    // 3. Create document in specific collection
    if (role === "student") {
      await databases.createDocument(DB_ID, "Students", ID.unique(), {
        accountId: userAccount.$id,
        fullName,
      });
    } else if (role === "school") {
      await databases.createDocument(DB_ID, "Schools", ID.unique(), {
        ownerId: userAccount.$id,
        schoolName: fullName,
        contactEmail: email,
        isApproved: false,
      });
    } else if (role === "business") {
      await databases.createDocument(DB_ID, "Businesses", ID.unique(), {
        ownerId: userAccount.$id,
        companyName: fullName,
        contactEmail: email,
        isApproved: false,
      });
    }

    // 4. Auto-login after registration
    const session = await account.createEmailPasswordSession(email, password);
    const cookieStore = await cookies();
    cookieStore.set(`a_session_${PROJECT_ID}`, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(session.expire),
    });

    const pending = role === "school" || role === "business";
    return { success: true, role, pending };























  } catch (error) {
    console.error("[registerUser]", error);
    return { error: "Đăng ký thất bại. Email có thể đã được sử dụng." };
  }
}

/**
 * Update display name.
 */
export async function updateAccountName(newName: string) {
  try {
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length > 100)
      return { success: false, error: "Name must be 1–100 characters." };

    const { account } = await createSessionClient();
    await account.updateName(trimmed);

    return { success: true };
  } catch (error) {
    console.error("[updateAccountName]", error);
    return { success: false, error: "Failed to update name. Please try again." };
  }
}

/**
 * Change password — requires the current password for verification.
 */
export async function updateAccountPassword(currentPassword: string, newPassword: string) {
  try {
    if (!currentPassword || !newPassword)
      return { success: false, error: "Both passwords are required." };
    if (newPassword.length < 8)
      return { success: false, error: "New password must be at least 8 characters." };
    if (newPassword === currentPassword)
      return { success: false, error: "New password must be different from current password." };

    const { account } = await createSessionClient();
    await account.updatePassword(newPassword, currentPassword);

    return { success: true };
  } catch (error) {
    console.error("[updateAccountPassword]", error);
    // Appwrite returns 401 when current password is wrong — keep message vague
    return { success: false, error: "Incorrect current password or update failed." };
  }
}

/**
 * Change email — requires the current password for verification.
 */
export async function updateAccountEmail(newEmail: string, currentPassword: string) {
  try {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return { success: false, error: "Invalid email address." };
    if (!currentPassword)
      return { success: false, error: "Current password is required to change email." };

    const { account } = await createSessionClient();
    await account.updateEmail(trimmed, currentPassword);

    return { success: true };
  } catch (error) {
    console.error("[updateAccountEmail]", error);
    return { success: false, error: "Failed to update email. Check your password and try again." };
  }
}

export async function logoutUser() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    
    const cookieStore = await cookies();
    // delete the session cookie
    cookieStore.delete(`a_session_${PROJECT_ID}`);
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Đăng xuất thất bại" };
  }
}


export async function getSessionStatus(): Promise<{ loggedIn: boolean; name: string | null }> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return { loggedIn: true, name: user.name ?? null };
  } catch {
    return { loggedIn: false, name: null };
  }
}
