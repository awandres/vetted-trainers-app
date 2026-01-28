import { NextRequest, NextResponse } from "next/server";
import { db, vtPayrollPeriods, vtPayrollDetails, vtTrainers, vtSessions, eq, desc, sql, gte, and } from "@vt/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the trainer ID for this user
    let trainerId = session.user.trainerId;
    let trainerName = session.user.name;

    if (!trainerId && session.user.role === "trainer") {
      const [trainer] = await db
        .select({ id: vtTrainers.id, name: vtTrainers.name })
        .from(vtTrainers)
        .where(eq(vtTrainers.email, session.user.email))
        .limit(1);
      
      trainerId = trainer?.id;
      trainerName = trainer?.name || session.user.name;
    }

    if (!trainerId && session.user.role !== "admin") {
      return NextResponse.json({ 
        currentPeriod: null,
        trainerDetails: null,
        recentPeriods: [],
        ytdStats: {
          totalEarnings: 0,
          totalSessions: 0,
          averagePerSession: 0,
        },
        message: "No trainer profile linked to this account"
      });
    }

    // Get all payroll periods ordered by date (most recent first)
    const periods = await db
      .select()
      .from(vtPayrollPeriods)
      .orderBy(desc(vtPayrollPeriods.weekStart))
      .limit(12);

    // Get trainer's payroll details for these periods
    const periodIds = periods.map(p => p.id);
    
    let details: Record<string, typeof vtPayrollDetails.$inferSelect> = {};
    
    if (trainerId && periodIds.length > 0) {
      const allDetails = await db
        .select()
        .from(vtPayrollDetails)
        .where(eq(vtPayrollDetails.trainerId, trainerId));
      
      details = allDetails.reduce((acc, d) => {
        if (d.payrollPeriodId) {
          acc[d.payrollPeriodId] = d;
        }
        return acc;
      }, {} as Record<string, typeof vtPayrollDetails.$inferSelect>);
    }

    // Map periods with their details
    const recentPeriods = periods.map(period => ({
      period: {
        id: period.id,
        weekStart: period.weekStart,
        weekEnd: period.weekEnd,
        totalRevenue: period.totalRevenue || 0,
        totalSessions: period.totalSessions || 0,
        status: period.status || "pending",
      },
      details: details[period.id] ? {
        id: details[period.id].id,
        trainerPay: details[period.id].trainerPay || 0,
        sessionCount: details[period.id].sessionCount || 0,
        totalRevenue: details[period.id].totalRevenue || 0,
        trainerName: details[period.id].trainerName || trainerName || "",
      } : null,
    }));

    // Calculate YTD stats
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    
    let ytdStats = {
      totalEarnings: 0,
      totalSessions: 0,
      averagePerSession: 0,
    };

    if (trainerId) {
      const [ytd] = await db
        .select({
          totalPay: sql<number>`coalesce(sum(${vtPayrollDetails.trainerPay}), 0)::int`,
          totalSessions: sql<number>`coalesce(sum(${vtPayrollDetails.sessionCount}), 0)::int`,
        })
        .from(vtPayrollDetails)
        .innerJoin(vtPayrollPeriods, eq(vtPayrollDetails.payrollPeriodId, vtPayrollPeriods.id))
        .where(
          and(
            eq(vtPayrollDetails.trainerId, trainerId),
            gte(vtPayrollPeriods.weekStart, yearStart)
          )
        );

      if (ytd) {
        ytdStats = {
          totalEarnings: ytd.totalPay,
          totalSessions: ytd.totalSessions,
          averagePerSession: ytd.totalSessions > 0 
            ? Math.round(ytd.totalPay / ytd.totalSessions) 
            : 0,
        };
      }
    }

    return NextResponse.json({
      currentPeriod: recentPeriods[0]?.period || null,
      trainerDetails: recentPeriods[0]?.details || null,
      recentPeriods,
      ytdStats,
    });
  } catch (error) {
    console.error("Error fetching trainer payroll:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll" },
      { status: 500 }
    );
  }
}
