import { NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, vtContracts, eq, sql, and, lte, gte } from "@vt/db";

// GET alerts for dashboard
export async function GET() {
  try {
    // Get current date for comparison
    const today = new Date().toISOString().split("T")[0];

    // Get inactive members (14-45 days since visit) grouped by trainer
    // Using sql for greater than since gt isn't exported
    const inactiveMembers = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        lastVisitDate: vtMembers.lastVisitDate,
        daysSinceVisit: vtMembers.daysSinceVisit,
        trainerId: vtMembers.trainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtMembers)
      .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
      .where(
        and(
          sql`${vtMembers.daysSinceVisit} > 14`,
          lte(vtMembers.daysSinceVisit, 45),
          eq(vtMembers.status, "inactive")
        )
      )
      .orderBy(vtMembers.daysSinceVisit);

    // Get churned members (>45 days since visit) grouped by trainer
    const churnedMembers = await db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        lastVisitDate: vtMembers.lastVisitDate,
        daysSinceVisit: vtMembers.daysSinceVisit,
        trainerId: vtMembers.trainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtMembers)
      .leftJoin(vtTrainers, eq(vtMembers.trainerId, vtTrainers.id))
      .where(
        and(
          sql`${vtMembers.daysSinceVisit} > 45`,
          eq(vtMembers.status, "churned")
        )
      )
      .orderBy(vtMembers.daysSinceVisit);

    // Get contracts expiring soon (within 14 days)
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    const expiringDate = fourteenDaysFromNow.toISOString().split("T")[0];

    const expiringContracts = await db
      .select({
        id: vtContracts.id,
        contractType: vtContracts.contractType,
        endDate: vtContracts.endDate,
        memberId: vtContracts.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        trainerId: vtContracts.initialTrainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtContracts)
      .leftJoin(vtMembers, eq(vtContracts.memberId, vtMembers.id))
      .leftJoin(vtTrainers, eq(vtContracts.initialTrainerId, vtTrainers.id))
      .where(
        and(
          eq(vtContracts.status, "active"),
          gte(vtContracts.endDate, today),
          lte(vtContracts.endDate, expiringDate)
        )
      )
      .orderBy(vtContracts.endDate);

    // Group inactive by trainer
    const inactiveByTrainer = groupByTrainer(inactiveMembers);
    const churnedByTrainer = groupByTrainer(churnedMembers);

    // Summary counts
    const summary = {
      totalInactive: inactiveMembers.length,
      totalChurned: churnedMembers.length,
      expiringContracts: expiringContracts.length,
    };

    return NextResponse.json({
      summary,
      inactiveMembers: inactiveByTrainer,
      churnedMembers: churnedByTrainer,
      expiringContracts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// Helper to group members by trainer
function groupByTrainer(members: Array<{
  id: string;
  firstName: string | null;
  lastName: string | null;
  lastVisitDate: string | null;
  daysSinceVisit: number | null;
  trainerId: string | null;
  trainerFirstName: string | null;
  trainerLastName: string | null;
}>) {
  const grouped: Record<string, {
    trainerId: string | null;
    trainerName: string;
    members: Array<{
      id: string;
      name: string;
      lastVisitDate: string | null;
      daysSinceVisit: number | null;
    }>;
  }> = {};

  for (const member of members) {
    const key = member.trainerId || "unassigned";
    const trainerName = member.trainerId
      ? `${member.trainerFirstName || ""} ${member.trainerLastName || ""}`.trim()
      : "Unassigned";

    if (!grouped[key]) {
      grouped[key] = {
        trainerId: member.trainerId,
        trainerName,
        members: [],
      };
    }

    grouped[key].members.push({
      id: member.id,
      name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
      lastVisitDate: member.lastVisitDate,
      daysSinceVisit: member.daysSinceVisit,
    });
  }

  return Object.values(grouped).sort((a, b) => b.members.length - a.members.length);
}
