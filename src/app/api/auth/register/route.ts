import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const { account, databases, users } = await createAdminClient();

    // 1. Create Appwrite account
    const userAccount = await account.create(ID.unique(), email, password, fullName);

    // 2. Set role = student in prefs
    await users.updatePrefs(userAccount.$id, { role: "student" });

    // 3. Create Students document
    await databases.createDocument(DB_ID, "Students", ID.unique(), {
      accountId: userAccount.$id,
      fullName,
    });

    return NextResponse.json({ success: true, userId: userAccount.$id }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/auth/register]", error);
    const message = error?.message?.includes("already exists")
      ? "Email is already in use."
      : "Registration failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
