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

    return { success: true, role };
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: error?.message || "Đăng nhập thất bại." };
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
        schoolName: fullName, // using fullName as schoolName
        contactEmail: email,
      });
    } else if (role === "business") {
      await databases.createDocument(DB_ID, "Businesses", ID.unique(), {
        ownerId: userAccount.$id,
        companyName: fullName, // using fullName as companyName
        industry: "Khác", // placeholder
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

    return { success: true, role };
  } catch (error: any) {
    console.error("Register error:", error);
    return { error: error?.message || "Đăng ký thất bại." };
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
