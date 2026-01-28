import { NextRequest, NextResponse } from "next/server";
import { db, websiteBlocks, websiteBlockHistory, createId, eq, and } from "@vt/db";

// POST - Restore a block to a previous version
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageSlug, blockId, targetVersion } = body;

    if (!pageSlug || !blockId || targetVersion === undefined) {
      return NextResponse.json(
        { error: "pageSlug, blockId, and targetVersion are required" },
        { status: 400 }
      );
    }

    // Find the target version in history
    const [historyRecord] = await db
      .select()
      .from(websiteBlockHistory)
      .where(
        and(
          eq(websiteBlockHistory.pageSlug, pageSlug),
          eq(websiteBlockHistory.blockId, blockId),
          eq(websiteBlockHistory.version, targetVersion)
        )
      )
      .limit(1);

    if (!historyRecord) {
      return NextResponse.json(
        { error: `Version ${targetVersion} not found for this block` },
        { status: 404 }
      );
    }

    // Get current block
    const [currentBlock] = await db
      .select()
      .from(websiteBlocks)
      .where(
        and(
          eq(websiteBlocks.pageSlug, pageSlug),
          eq(websiteBlocks.blockId, blockId)
        )
      )
      .limit(1);

    if (!currentBlock) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    // Save current version to history before restoring
    await db.insert(websiteBlockHistory).values({
      id: createId(),
      blockId: currentBlock.blockId,
      pageSlug: currentBlock.pageSlug,
      version: currentBlock.version,
      content: currentBlock.content,
      settings: currentBlock.settings,
      editedAt: new Date(),
      changeNotes: `Replaced by restore to version ${targetVersion}`,
    });

    // Restore the old version (increment version number)
    const newVersion = currentBlock.version + 1;
    await db
      .update(websiteBlocks)
      .set({
        content: historyRecord.content,
        settings: historyRecord.settings,
        version: newVersion,
        isPublished: false, // Mark as unpublished after restore
        updatedAt: new Date(),
      })
      .where(eq(websiteBlocks.id, currentBlock.id));

    return NextResponse.json({
      success: true,
      message: `Restored to version ${targetVersion}`,
      newVersion,
      restoredFromVersion: targetVersion,
    });
  } catch (error) {
    console.error("Failed to restore block version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}
