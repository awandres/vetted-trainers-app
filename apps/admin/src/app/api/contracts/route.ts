import { NextRequest, NextResponse } from "next/server";
import { db, vtContracts, vtMembers, vtTrainers, eq, desc, and, sql, gte, lte } from "@vt/db";

// GET contracts with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const contractType = searchParams.get("contractType");
    const trainerId = searchParams.get("trainerId");
    const memberId = searchParams.get("memberId");
    const expiringSoon = searchParams.get("expiringSoon") === "true";

    // Build conditions
    const conditions = [];
    if (status) conditions.push(eq(vtContracts.status, status));
    if (contractType) conditions.push(eq(vtContracts.contractType, contractType));
    if (trainerId) conditions.push(eq(vtContracts.initialTrainerId, trainerId));
    if (memberId) conditions.push(eq(vtContracts.memberId, memberId));

    // Filter for contracts expiring in next 14 days
    if (expiringSoon) {
      const today = new Date().toISOString().split("T")[0];
      const fourteenDaysFromNow = new Date();
      fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
      const expiringDate = fourteenDaysFromNow.toISOString().split("T")[0];
      
      conditions.push(eq(vtContracts.status, "active"));
      conditions.push(gte(vtContracts.endDate, today));
      conditions.push(lte(vtContracts.endDate, expiringDate));
    }

    // Query with joins
    const contracts = await db
      .select({
        id: vtContracts.id,
        memberId: vtContracts.memberId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberEmail: vtMembers.email,
        contractType: vtContracts.contractType,
        pricePerSession: vtContracts.pricePerSession,
        weeklySessions: vtContracts.weeklySessions,
        lengthWeeks: vtContracts.lengthWeeks,
        totalValue: vtContracts.totalValue,
        startDate: vtContracts.startDate,
        endDate: vtContracts.endDate,
        status: vtContracts.status,
        commissionRate: vtContracts.commissionRate,
        commissionAmount: vtContracts.commissionAmount,
        hasEnrollmentFee: vtContracts.hasEnrollmentFee,
        alertStatus: vtContracts.alertStatus,
        contractNotes: vtContracts.contractNotes,
        initialTrainerId: vtContracts.initialTrainerId,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
        createdAt: vtContracts.createdAt,
      })
      .from(vtContracts)
      .leftJoin(vtMembers, eq(vtContracts.memberId, vtMembers.id))
      .leftJoin(vtTrainers, eq(vtContracts.initialTrainerId, vtTrainers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vtContracts.startDate));

    // Transform to include nested objects
    const transformedContracts = contracts.map((c) => ({
      id: c.id,
      contractType: c.contractType,
      pricePerSession: c.pricePerSession,
      weeklySessions: c.weeklySessions,
      lengthWeeks: c.lengthWeeks,
      totalValue: c.totalValue,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      commissionRate: c.commissionRate,
      commissionAmount: c.commissionAmount,
      hasEnrollmentFee: c.hasEnrollmentFee,
      alertStatus: c.alertStatus,
      contractNotes: c.contractNotes,
      createdAt: c.createdAt,
      member: c.memberId
        ? {
            id: c.memberId,
            firstName: c.memberFirstName,
            lastName: c.memberLastName,
            email: c.memberEmail,
          }
        : null,
      trainer: c.initialTrainerId
        ? {
            id: c.initialTrainerId,
            firstName: c.trainerFirstName,
            lastName: c.trainerLastName,
          }
        : null,
    }));

    // Get summary stats
    const allContracts = await db
      .select({
        status: vtContracts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vtContracts)
      .groupBy(vtContracts.status);

    const stats = {
      active: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    };

    for (const row of allContracts) {
      if (row.status && row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
      stats.total += row.count;
    }

    // Get expiring soon count
    const today = new Date().toISOString().split("T")[0];
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    const expiringDate = fourteenDaysFromNow.toISOString().split("T")[0];

    const [expiringCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(vtContracts)
      .where(
        and(
          eq(vtContracts.status, "active"),
          gte(vtContracts.endDate, today),
          lte(vtContracts.endDate, expiringDate)
        )
      );

    return NextResponse.json({
      contracts: transformedContracts,
      stats: {
        ...stats,
        expiringSoon: expiringCount?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST create new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      contractType,
      pricePerSession,
      weeklySessions,
      lengthWeeks,
      startDate,
      initialTrainerId,
      hasEnrollmentFee,
      contractNotes,
    } = body;

    if (!memberId || !contractType || !pricePerSession || !weeklySessions || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate end date
    let endDate = null;
    if (lengthWeeks) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + lengthWeeks * 7);
      endDate = start.toISOString().split("T")[0];
    }

    // Calculate total value (price × sessions × weeks)
    const totalValue = lengthWeeks
      ? Math.round(pricePerSession * 100) * weeklySessions * lengthWeeks
      : null;

    // Determine commission rate based on contract type
    let commissionRate = "0";
    if (contractType === "training_agreement") {
      commissionRate = "0.05"; // 5%
    } else if (contractType === "price_lock") {
      commissionRate = "0.025"; // 2.5%
    }

    // Calculate commission amount
    const commissionAmount = totalValue
      ? Math.round(totalValue * parseFloat(commissionRate))
      : null;

    const [newContract] = await db
      .insert(vtContracts)
      .values({
        memberId,
        contractType,
        pricePerSession: Math.round(pricePerSession * 100),
        weeklySessions,
        lengthWeeks: lengthWeeks || null,
        totalValue,
        startDate,
        endDate,
        status: "active",
        commissionRate,
        commissionAmount,
        hasEnrollmentFee: hasEnrollmentFee || false,
        initialTrainerId: initialTrainerId || null,
        contractNotes: contractNotes || null,
        alertStatus: null,
      })
      .returning();

    return NextResponse.json({ contract: newContract }, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
