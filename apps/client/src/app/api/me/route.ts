import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, eq } from "@vt/db";
import { auth } from "@vt/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find member linked to this user's email
    const [member] = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        email: vtMembers.email,
        phone: vtMembers.phone,
        status: vtMembers.status,
        trainerId: vtMembers.trainerId,
        trainerName: vtTrainers.name,
        lastVisitDate: vtMembers.lastVisitDate,
        daysSinceVisit: vtMembers.daysSinceVisit,
        notes: vtMembers.notes,
        createdAt: vtMembers.createdAt,
      })
      .from(vtMembers)
      .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
      .where(eq(vtMembers.email, session.user.email));

    if (!member) {
      return NextResponse.json({ 
        error: "No member profile found", 
        user: session.user 
      }, { status: 404 });
    }

    return NextResponse.json({ member, user: session.user });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json({ error: "Failed to fetch member data" }, { status: 500 });
  }
}
