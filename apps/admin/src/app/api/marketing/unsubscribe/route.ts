import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtEmailEvents, eq } from "@vt/db";

// Handle unsubscribe requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, campaignId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find member by email
    const [member] = await db
      .select()
      .from(vtMembers)
      .where(eq(vtMembers.email, email));

    if (!member) {
      // Still return success to prevent email enumeration
      return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
    }

    // Update member opt-out status
    await db
      .update(vtMembers)
      .set({
        emailOptOut: true,
        emailOptOutAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vtMembers.id, member.id));

    // Record unsubscribe event if campaign ID provided
    if (campaignId) {
      await db.insert(vtEmailEvents).values({
        campaignId,
        recipientEmail: email,
        memberId: member.id,
        eventType: "unsubscribed",
      });
    }

    console.log(`📧 Member unsubscribed: ${email}`);

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Error processing unsubscribe:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe" }, { status: 500 });
  }
}

// Also handle GET for unsubscribe links (redirects to confirmation page)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const campaignId = searchParams.get("campaign");

  if (!email) {
    return NextResponse.redirect(new URL("/unsubscribe?error=missing_email", request.url));
  }

  // Process unsubscribe
  try {
    const [member] = await db
      .select()
      .from(vtMembers)
      .where(eq(vtMembers.email, email));

    if (member) {
      await db
        .update(vtMembers)
        .set({
          emailOptOut: true,
          emailOptOutAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vtMembers.id, member.id));

      if (campaignId) {
        await db.insert(vtEmailEvents).values({
          campaignId,
          recipientEmail: email,
          memberId: member.id,
          eventType: "unsubscribed",
        });
      }
    }

    // Redirect to confirmation page
    return NextResponse.redirect(new URL("/unsubscribe?success=true", request.url));
  } catch {
    return NextResponse.redirect(new URL("/unsubscribe?error=failed", request.url));
  }
}
