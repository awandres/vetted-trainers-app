/**
 * Content fetching utilities for the public website
 * Reads only published content from the database
 */

import { db, websiteBlocks, eq, and } from "@vt/db";

export interface WebsiteContent {
  html?: string;
  doc?: object;
  src?: string;
  alt?: string;
  caption?: string;
}

/**
 * Get a single published block's content
 */
export async function getPublishedBlock(
  pageSlug: string,
  blockId: string
): Promise<WebsiteContent | null> {
  try {
    const [block] = await db
      .select()
      .from(websiteBlocks)
      .where(
        and(
          eq(websiteBlocks.pageSlug, pageSlug),
          eq(websiteBlocks.blockId, blockId),
          eq(websiteBlocks.isPublished, true)
        )
      )
      .limit(1);

    if (!block) {
      return null;
    }

    return block.content as WebsiteContent;
  } catch (error) {
    console.error(`Failed to fetch block ${blockId} for page ${pageSlug}:`, error);
    return null;
  }
}

/**
 * Get all published blocks for a page
 */
export async function getPublishedPageContent(
  pageSlug: string
): Promise<Record<string, WebsiteContent>> {
  try {
    const blocks = await db
      .select()
      .from(websiteBlocks)
      .where(
        and(
          eq(websiteBlocks.pageSlug, pageSlug),
          eq(websiteBlocks.isPublished, true)
        )
      );

    const content: Record<string, WebsiteContent> = {};
    for (const block of blocks) {
      content[block.blockId] = block.content as WebsiteContent;
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch content for page ${pageSlug}:`, error);
    return {};
  }
}

/**
 * Convert Tiptap JSON to plain text
 */
export function tiptapToText(doc: object | undefined): string {
  if (!doc || typeof doc !== "object") return "";
  
  // Extract text from Tiptap document structure
  function extractText(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const n = node as Record<string, unknown>;
    
    if (n.text && typeof n.text === "string") {
      return n.text;
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map(extractText).join("");
    }
    
    return "";
  }
  
  return extractText(doc);
}

/**
 * Get text content from a block, with fallback to default
 */
export async function getBlockText(
  pageSlug: string,
  blockId: string,
  defaultText: string
): Promise<string> {
  const content = await getPublishedBlock(pageSlug, blockId);
  
  if (!content) {
    return defaultText;
  }
  
  // Handle Tiptap document
  if (content.doc) {
    const text = tiptapToText(content.doc);
    return text || defaultText;
  }
  
  // Handle plain HTML
  if (content.html) {
    // Strip HTML tags for plain text
    return content.html.replace(/<[^>]*>/g, "") || defaultText;
  }
  
  return defaultText;
}

/**
 * Get image content from a block, with fallback to default
 */
export async function getBlockImage(
  pageSlug: string,
  blockId: string,
  defaultSrc: string,
  defaultAlt: string
): Promise<{ src: string; alt: string }> {
  const content = await getPublishedBlock(pageSlug, blockId);
  
  if (!content) {
    return { src: defaultSrc, alt: defaultAlt };
  }
  
  return {
    src: content.src || defaultSrc,
    alt: content.alt || defaultAlt,
  };
}
