import { NextRequest, NextResponse } from "next/server";
import { db, vtSessions, vtMembers, vtTrainers, eq, desc, and, gte, lte, sql } from "@vt/db";

// GET sessions with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trainerId = searchParams.get("trainerId");
    const memberId = searchParams.get("memberId");
    const weekEnding = searchParams.get("weekEnding");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build conditions
    const conditions = [];
    if (trainerId) conditions.push(eq(vtSessions.trainerId, trainerId));
    if (memberId) conditions.push(eq(vtSessions.memberId, memberId));
    if (weekEnding) conditions.push(eq(vtSessions.weekEnding, weekEnding));
    if (startDate) conditions.push(gte(vtSessions.sessionDate, startDate));
    if (endDate) conditions.push(lte(vtSessions.sessionDate, endDate));

    // Query with joins
    const sessions = await db
      .select({
        id: vtSessions.id,
        sessionDate: vtSessions.sessionDate,
        sessionType: vtSessions.sessionType,
        sessionValue: vtSessions.sessionValue,
        priceCharged: vtSessions.priceCharged,
        weekEnding: vtSessions.weekEnding,
        notes: vtSessions.notes,
        createdAt: vtSessions.createdAt,
        trainerId: vtSessions.trainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
        memberId: vtSessions.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
      })
      .from(vtSessions)
      .leftJoin(vtTrainers, eq(vtSessions.trainerId, vtTrainers.id))
      .leftJoin(vtMembers, eq(vtSessions.memberId, vtMembers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vtSessions.sessionDate))
      .limit(limit);

    // Transform to include nested objects
    const transformedSessions = sessions.map((s) => ({
      id: s.id,
      sessionDate: s.sessionDate,
      sessionType: s.sessionType,
      sessionValue: s.sessionValue,
      priceCharged: s.priceCharged,
      weekEnding: s.weekEnding,
      notes: s.notes,
      createdAt: s.createdAt,
      trainer: s.trainerId
        ? { id: s.trainerId, firstName: s.trainerFirstName, lastName: s.trainerLastName }
        : null,
      member: s.memberId
        ? { id: s.memberId, firstName: s.memberFirstName, lastName: s.memberLastName }
        : null,
    }));

    return NextResponse.json({ sessions: transformedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      trainerId,
      sessionDate,
      sessionType = "in_gym",
      sessionValue = "1.0",
      priceCharged,
      notes,
    } = body;

    if (!trainerId) {
      return NextResponse.json(
        { error: "trainerId is required" },
        { status: 400 }
      );
    }

    if (!sessionDate) {
      return NextResponse.json(
        { error: "sessionDate is required" },
        { status: 400 }
      );
    }

    // Calculate week ending (Saturday)
    const date = new Date(sessionDate);
    const dayOfWeek = date.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const weekEndingDate = new Date(date);
    weekEndingDate.setDate(date.getDate() + daysUntilSaturday);
    const weekEnding = weekEndingDate.toISOString().split("T")[0];

    // Insert session
    const [newSession] = await db
      .insert(vtSessions)
      .values({
        memberId: memberId || null,
        trainerId,
        sessionDate,
        sessionType,
        sessionValue,
        priceCharged: priceCharged ? Math.round(priceCharged * 100) : null,
        weekEnding,
        notes: notes || null,
      })
      .returning();

    // Update member's last visit date if member provided
    if (memberId) {
      await db
        .update(vtMembers)
        .set({
          lastVisitDate: sessionDate,
          daysSinceVisit: 0,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(vtMembers.id, memberId));

      // Trigger automated "session_booked" email
      try {
        // Get member and trainer info for the email
        const [member] = await db
          .select()
          .from(vtMembers)
          .where(eq(vtMembers.id, memberId));
        
        const [trainer] = await db
          .select()
          .from(vtTrainers)
          .where(eq(vtTrainers.id, trainerId));

        console.log("[Session Email Trigger] Member:", member?.firstName, "Email:", member?.email);

        if (member?.email) {
          // Format date for email
          const dateObj = new Date(sessionDate);
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          console.log("[Session Email Trigger] Calling trigger API for session_booked...");

          // Trigger the automated email (fire and forget)
          const triggerUrl = `${request.nextUrl.origin}/api/marketing/automated/trigger`;
          fetch(triggerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trigger: "session_booked",
              memberId: memberId,
              recipientEmail: member.email,
              recipientName: member.firstName,
              data: {
                sessionDate: formattedDate,
                sessionTime: "See your trainer for details",
                trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : "Your Trainer",
                sessionType: sessionType,
              },
            }),
          })
            .then(async (res) => {
              const data = await res.json();
              console.log("[Session Email Trigger] Response:", data);
            })
            .catch((err) => console.error("[Session Email Trigger] Failed:", err));
        } else {
          console.log("[Session Email Trigger] Skipped - member has no email");
        }
      } catch (emailErr) {
        // Don't fail the session creation if email fails
        console.error("[Session Email Trigger] Error:", emailErr);
      }
    }

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
