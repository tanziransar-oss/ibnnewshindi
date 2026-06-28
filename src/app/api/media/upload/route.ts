import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireArticleWriteAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const denied = await requireArticleWriteAccess(request);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";
    const fileSizeStr = (file.size / 1024).toFixed(0) + " KB";

    // Convert file buffer directly to Base64 Data URL to store in CockroachDB
    const base64Data = buffer.toString("base64");
    const fileUrl = `data:${contentType};base64,${base64Data}`;

    // Register media file metadata with Base64 inline content inside CockroachDB
    const id = "m_" + Date.now();
    const mediaRecord = {
      id,
      name: file.name,
      url: fileUrl,
      type: file.type.startsWith("video") ? ("video" as const) : ("image" as const),
      size: fileSizeStr,
      date: new Date().toISOString().split("T")[0],
      width: 800,
      height: 450,
    };

    console.log(`Successfully converted ${file.name} to Base64 and saving to CockroachDB...`);
    await db.insertInto("media_item").values(mediaRecord).execute();

    return NextResponse.json(mediaRecord);
  } catch (err) {
    console.error("Error saving file directly to CockroachDB:", err);
    return NextResponse.json({ error: "Failed to upload file to database" }, { status: 500 });
  }
}
