import { NextRequest, NextResponse } from "next/server";
import { getUploadUrl, getPublicUrl, generateFileKey } from "@/lib/r2";

/**
 * GET: Generate a presigned URL for browser upload
 * 
 * Flow:
 * 1. Client requests presigned URL with file metadata
 * 2. Server generates URL (no file data transferred)
 * 3. Client uploads directly to R2 using the URL
 * 4. After successful upload, the client uses the publicUrl
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const category = searchParams.get("category") || "website";

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 }
      );
    }

    // Check if R2 is configured
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json(
        { error: "R2 storage is not configured. Please set R2 environment variables." },
        { status: 500 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(fileName, category);

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(fileKey, fileType);
    const publicUrl = getPublicUrl(fileKey);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      fileKey,
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
