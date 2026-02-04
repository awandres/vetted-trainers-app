import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtContracts, vtTrainers, users, sessions, eq, and, gt, desc } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies (check both regular and __Secure- prefixed for production)
    let sessionToken = request.cookies.get("better-auth.session_token")?.value
      || request.cookies.get("__Secure-better-auth.session_token")?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }

    // Extract token from signed format
    if (sessionToken.includes(".")) {
      sessionToken = sessionToken.split(".")[0];
    }

    // Look up session in database
    const [authSession] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (!authSession) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get user with memberId
    const [user] = await db
      .select({ memberId: users.memberId, email: users.email })
      .from(users)
      .where(eq(users.id, authSession.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    let memberId = user.memberId;

    // If no memberId on user, try to find by email
    if (!memberId && user.email) {
      const [member] = await db
        .select({ id: vtMembers.id })
        .from(vtMembers)
        .where(eq(vtMembers.email, user.email));
      memberId = member?.id;
    }

    if (!memberId) {
      return NextResponse.json({ error: "No member profile found" }, { status: 404 });
    }

    // Get contracts for this member (most recent first)
    const contracts = await db
      .select({
        id: vtContracts.id,
        contractType: vtContracts.contractType,
        lengthWeeks: vtContracts.lengthWeeks,
        pricePerSession: vtContracts.pricePerSession,
        weeklySessions: vtContracts.weeklySessions,
        startDate: vtContracts.startDate,
        endDate: vtContracts.endDate,
        status: vtContracts.status,
        totalValue: vtContracts.totalValue,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
        createdAt: vtContracts.createdAt,
      })
      .from(vtContracts)
      .leftJoin(vtTrainers, eq(vtContracts.initialTrainerId, vtTrainers.id))
      .where(eq(vtContracts.memberId, memberId))
      .orderBy(desc(vtContracts.createdAt));

    // Format contracts
    const formattedContracts = contracts.map(c => ({
      id: c.id,
      contractType: c.contractType,
      lengthWeeks: c.lengthWeeks,
      pricePerSession: c.pricePerSession,
      weeklySessions: c.weeklySessions,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      totalValue: c.totalValue,
      trainerName: c.trainerFirstName 
        ? `${c.trainerFirstName} ${c.trainerLastName || ''}`.trim()
        : null,
      createdAt: c.createdAt,
    }));

    // Get the active contract
    const activeContract = formattedContracts.find(c => c.status === "active" || c.status === "expiring_soon");

    return NextResponse.json({
      activeContract: activeContract || null,
      contracts: formattedContracts,
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}
