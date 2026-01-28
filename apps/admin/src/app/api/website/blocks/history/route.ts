import { NextRequest, NextResponse } from "next/server";
import { db, websiteBlockHistory, desc, eq, and } from "@vt/db";

// GET - Retrieve version history for a specific block
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug") || "home";
    const blockId = searchParams.get("blockId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!blockId) {
      return NextResponse.json(
        { error: "blockId is required" },
        { status: 400 }
      );
    }

    const history = await db
      .select()
      .from(websiteBlockHistory)
      .where(
        and(
          eq(websiteBlockHistory.pageSlug, pageSlug),
          eq(websiteBlockHistory.blockId, blockId)
        )
      )
      .orderBy(desc(websiteBlockHistory.version))
      .limit(limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to fetch block history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
