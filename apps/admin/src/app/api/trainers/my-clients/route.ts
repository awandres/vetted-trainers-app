import { NextRequest, NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, vtSessions, users, eq, desc, sql, gte, and } from "@vt/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the trainer ID for this user
    let trainerId = session.user.trainerId;

    // If user is a trainer but doesn't have trainerId set, try to find by email
    if (!trainerId && session.user.role === "trainer") {
      const [trainer] = await db
        .select({ id: vtTrainers.id })
        .from(vtTrainers)
        .where(eq(vtTrainers.email, session.user.email))
        .limit(1);
      
      trainerId = trainer?.id;
    }

    // Admins can see all clients if no trainerId
    const isAdmin = session.user.role === "admin";

    if (!trainerId && !isAdmin) {
      return NextResponse.json({ 
        clients: [],
        weekSessions: 0,
        weekRevenue: 0,
        pendingTasks: 0,
        message: "No trainer profile linked to this account"
      });
    }

    // Fetch clients for this trainer
    const clientsQuery = db
      .select({
        id: vtMembers.id,
        firstName: vtMembers.firstName,
        lastName: vtMembers.lastName,
        email: vtMembers.email,
        phone: vtMembers.phone,
        status: vtMembers.status,
        daysSinceVisit: vtMembers.daysSinceVisit,
        lastVisitDate: vtMembers.lastVisitDate,
        pricePerSession: vtMembers.pricePerSession,
      })
      .from(vtMembers)
      .orderBy(desc(vtMembers.lastVisitDate));

    // Filter by trainer if not admin viewing all
    const clients = trainerId
      ? await clientsQuery.where(eq(vtMembers.trainerId, trainerId))
      : await clientsQuery;

    // Calculate this week's stats
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const sundayStr = sunday.toISOString().split("T")[0];

    let weekStats = { totalSessions: 0, totalRevenue: 0 };

    if (trainerId) {
      const [stats] = await db
        .select({
          totalSessions: sql<number>`coalesce(sum(${vtSessions.sessionValue}::numeric), 0)::int`,
          totalRevenue: sql<number>`coalesce(sum(${vtSessions.priceCharged}), 0)::int`,
        })
        .from(vtSessions)
        .where(
          and(
            eq(vtSessions.trainerId, trainerId),
            gte(vtSessions.sessionDate, sundayStr)
          )
        );
      
      weekStats = stats || { totalSessions: 0, totalRevenue: 0 };
    }

    // Count pending tasks (clients needing attention)
    const pendingTasks = clients.filter(c => 
      c.status === "inactive" || 
      (c.daysSinceVisit && c.daysSinceVisit > 7)
    ).length;

    return NextResponse.json({
      clients,
      weekSessions: weekStats.totalSessions,
      weekRevenue: weekStats.totalRevenue,
      pendingTasks,
    });
  } catch (error) {
    console.error("Error fetching trainer clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
