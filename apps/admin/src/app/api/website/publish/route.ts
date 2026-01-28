import { NextRequest, NextResponse } from "next/server";
import { db, websiteBlocks, eq, sql } from "@vt/db";

// POST - Publish all draft content and trigger Vercel rebuild
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pageSlug } = body; // Optional: publish only a specific page

    // Mark all unpublished blocks as published
    const whereClause = pageSlug 
      ? sql`${websiteBlocks.pageSlug} = ${pageSlug} AND ${websiteBlocks.isPublished} = false`
      : sql`${websiteBlocks.isPublished} = false`;

    const result = await db
      .update(websiteBlocks)
      .set({
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(websiteBlocks.isPublished, false));

    // Trigger Vercel Deploy Hook if configured
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    let deployTriggered = false;
    let deployError = null;

    if (deployHookUrl) {
      try {
        const deployResponse = await fetch(deployHookUrl, {
          method: "POST",
        });
        
        if (deployResponse.ok) {
          deployTriggered = true;
          console.log("✅ Vercel deploy triggered successfully");
        } else {
          deployError = `Deploy hook returned ${deployResponse.status}`;
          console.error("❌ Vercel deploy failed:", deployError);
        }
      } catch (error) {
        deployError = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Failed to trigger deploy:", deployError);
      }
    } else {
      console.warn("⚠️ VERCEL_DEPLOY_HOOK_URL not configured - skipping deploy");
    }

    return NextResponse.json({
      success: true,
      message: "Content published successfully",
      deployTriggered,
      deployError,
      deployHookConfigured: !!deployHookUrl,
    });
  } catch (error) {
    console.error("Failed to publish content:", error);
    return NextResponse.json(
      { error: "Failed to publish content" },
      { status: 500 }
    );
  }
}

// GET - Check publish status
export async function GET() {
  try {
    // Count published vs unpublished blocks
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        published: sql<number>`count(*) filter (where ${websiteBlocks.isPublished} = true)`,
        drafts: sql<number>`count(*) filter (where ${websiteBlocks.isPublished} = false)`,
      })
      .from(websiteBlocks);

    // Get last publish date
    const [lastPublished] = await db
      .select({
        lastPublishedAt: sql<Date>`max(${websiteBlocks.publishedAt})`,
      })
      .from(websiteBlocks);

    return NextResponse.json({
      stats: {
        total: Number(stats.total),
        published: Number(stats.published),
        drafts: Number(stats.drafts),
      },
      lastPublishedAt: lastPublished?.lastPublishedAt || null,
      deployHookConfigured: !!process.env.VERCEL_DEPLOY_HOOK_URL,
    });
  } catch (error) {
    console.error("Failed to get publish status:", error);
    return NextResponse.json(
      { error: "Failed to get publish status" },
      { status: 500 }
    );
  }
}
