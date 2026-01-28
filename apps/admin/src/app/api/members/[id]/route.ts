import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, vtContracts, vtPrescriptions, users, eq } from "@vt/db";
import { getServerSession } from "@/lib/auth";

// GET single member with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch member with trainer
    const [memberRow] = await db
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
        referredByMemberId: vtMembers.referredByMemberId,
        notes: vtMembers.notes,
        tags: vtMembers.tags,
        createdAt: vtMembers.createdAt,
        updatedAt: vtMembers.updatedAt,
        trainerId: vtMembers.trainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtMembers)
      .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
      .where(eq(vtMembers.id, id))
      .limit(1);

    if (!memberRow) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Fetch contracts for this member
    const contracts = await db
      .select()
      .from(vtContracts)
      .where(eq(vtContracts.memberId, id));

    // Fetch prescriptions for this member
    const prescriptions = await db
      .select()
      .from(vtPrescriptions)
      .where(eq(vtPrescriptions.memberId, id));

    const member = {
      ...memberRow,
      trainer: memberRow.trainerId
        ? {
            id: memberRow.trainerId,
            firstName: memberRow.trainerFirstName,
            lastName: memberRow.trainerLastName,
          }
        : null,
      contracts,
      prescriptions,
    };

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

// UPDATE member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      trainerId,
      pricePerSession,
      status,
      notes,
      referredBy,
      tags,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (trainerId !== undefined) updateData.trainerId = trainerId || null;
    if (pricePerSession !== undefined) {
      updateData.pricePerSession = pricePerSession ? Math.round(pricePerSession * 100) : null;
    }
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;
    if (referredBy !== undefined) updateData.referredBy = referredBy || null;
    if (tags !== undefined) updateData.tags = tags || [];

    const [updatedMember] = await db
      .update(vtMembers)
      .set(updateData)
      .where(eq(vtMembers.id, id))
      .returning();

    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE member or user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // If deleting an auth user (for team management)
    if (type === "user") {
      const session = await getServerSession();
      
      // Only admins can delete users
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Don't allow self-deletion
      if (id === session.user.id) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 }
        );
      }

      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!deletedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: deletedUser });
    }

    // Default: Delete VT member
    const [deletedMember] = await db
      .delete(vtMembers)
      .where(eq(vtMembers.id, id))
      .returning();

    if (!deletedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: deletedMember });
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
