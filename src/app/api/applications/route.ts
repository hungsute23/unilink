import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, targetId, targetType, notes } = body;

    if (!accountId || !targetId || !targetType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { databases } = await createAdminClient();

    // Check for duplicate application
    const existing = await databases.listDocuments(DB_ID, "Applications", [
      Query.equal("studentId", accountId),
      Query.equal("targetId", targetId),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      return NextResponse.json({ error: "Bạn đã nộp đơn cho mục này rồi." }, { status: 409 });
    }

    await databases.createDocument(DB_ID, "Applications", ID.unique(), {
      studentId: accountId,
      targetId,
      targetType,
      status: "pending",
      appliedAt: new Date().toISOString(),
      notes: notes ?? "",
      documentUrls: [],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json({ error: "Nộp đơn thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}
