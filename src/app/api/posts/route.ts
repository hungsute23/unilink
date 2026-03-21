import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) + `-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, authorName, title, content, tags } = body;

    if (!accountId || !authorName || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Thiếu thông tin bài viết." }, { status: 400 });
    }
    if (title.trim().length < 5) {
      return NextResponse.json({ error: "Tiêu đề tối thiểu 5 ký tự." }, { status: 400 });
    }
    if (content.trim().length < 20) {
      return NextResponse.json({ error: "Nội dung tối thiểu 20 ký tự." }, { status: 400 });
    }

    const { databases } = await createAdminClient();

    const excerpt = content.trim().slice(0, 160).replace(/\n+/g, " ");

    await databases.createDocument(DB_ID, "Posts", ID.unique(), {
      authorId: accountId,
      authorName,
      authorRole: "student",
      title: title.trim(),
      slug: slugify(title.trim()),
      content: content.trim(),
      excerpt,
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      status: "pending",
      publishedAt: new Date().toISOString(),
      viewCount: 0,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json({ error: "Đăng bài thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}
