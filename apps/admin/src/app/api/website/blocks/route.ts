import { NextRequest, NextResponse } from "next/server";
import { db, websiteBlocks, websiteBlockHistory, createId, eq, and } from "@vt/db";

// GET - Retrieve a specific block's content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug") || "home";
    const blockId = searchParams.get("blockId");

    if (!blockId) {
      return NextResponse.json(
        { error: "blockId is required" },
        { status: 400 }
      );
    }

    const [block] = await db
      .select()
      .from(websiteBlocks)
      .where(
        and(
          eq(websiteBlocks.pageSlug, pageSlug),
          eq(websiteBlocks.blockId, blockId)
        )
      )
      .limit(1);

    if (!block) {
      return NextResponse.json({ block: null });
    }

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Failed to fetch website block:", error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    );
  }
}

// POST - Save or update a block's content (with versioning)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageSlug, blockId, type, content, settings } = body;

    if (!pageSlug || !blockId || !type || !content) {
      return NextResponse.json(
        { error: "pageSlug, blockId, type, and content are required" },
        { status: 400 }
      );
    }

    // Check if block already exists
    const [existing] = await db
      .select()
      .from(websiteBlocks)
      .where(
        and(
          eq(websiteBlocks.pageSlug, pageSlug),
          eq(websiteBlocks.blockId, blockId)
        )
      )
      .limit(1);

    if (existing) {
      // Save current version to history before updating
      await db.insert(websiteBlockHistory).values({
        id: createId(),
        blockId: existing.blockId,
        pageSlug: existing.pageSlug,
        version: existing.version,
        content: existing.content,
        settings: existing.settings,
        editedAt: new Date(),
        changeNotes: null, // Could be passed from frontend
      });

      // Increment version and update block
      const newVersion = existing.version + 1;
      await db
        .update(websiteBlocks)
        .set({
          type,
          content,
          settings: settings || existing.settings,
          version: newVersion,
          updatedAt: new Date(),
        })
        .where(eq(websiteBlocks.id, existing.id));

      return NextResponse.json({ 
        success: true, 
        action: "updated",
        version: newVersion 
      });
    } else {
      // Create new block (version 1)
      await db.insert(websiteBlocks).values({
        id: createId(),
        pageSlug,
        blockId,
        type,
        content,
        settings: settings || null,
        version: 1,
        isPublished: false,
      });

      return NextResponse.json({ 
        success: true, 
        action: "created",
        version: 1 
      });
    }
  } catch (error) {
    console.error("Failed to save website block:", error);
    return NextResponse.json(
      { error: "Failed to save block" },
      { status: 500 }
    );
  }
}
