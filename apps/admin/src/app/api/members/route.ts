import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, users, eq, desc } from "@vt/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  // If requesting auth users (for team management)
  if (type === "users") {
    try {
      const session = await getServerSession();
      
      // Only admins can view user list
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          trainerId: users.trainerId,
          memberId: users.memberId,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      return NextResponse.json({ users: allUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  }

  // Default: Fetch VT members (training clients)
  try {
    // Fetch members with their assigned trainer
    const members = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        email: vtMembers.email,
        phone: vtMembers.phone,
        pricePerSession: vtMembers.pricePerSession,
        status: vtMembers.status,
        daysSinceVisit: vtMembers.daysSinceVisit,
        lastVisitDate: vtMembers.lastVisitDate,
        referredBy: vtMembers.referredBy,
        notes: vtMembers.notes,
        createdAt: vtMembers.createdAt,
        trainerId: vtMembers.trainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtMembers)
      .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
      .orderBy(desc(vtMembers.lastVisitDate));

    // Transform to include nested trainer object
    const transformedMembers = members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      pricePerSession: m.pricePerSession,
      status: m.status,
      daysSinceVisit: m.daysSinceVisit,
      lastVisitDate: m.lastVisitDate,
      referredBy: m.referredBy,
      notes: m.notes,
      createdAt: m.createdAt,
      trainer: m.trainerId
        ? {
            id: m.trainerId,
            firstName: m.trainerFirstName,
            lastName: m.trainerLastName,
          }
        : null,
    }));

    return NextResponse.json({ members: transformedMembers });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, trainerId, pricePerSession } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    const [newMember] = await db
      .insert(vtMembers)
      .values({
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        trainerId: trainerId || null,
        pricePerSession: pricePerSession ? pricePerSession * 100 : null,
        status: "active",
      })
      .returning();

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
