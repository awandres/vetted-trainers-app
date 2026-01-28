import { NextRequest, NextResponse } from "next/server";
import { db, vtPayrollPeriods, vtPayrollDetails, vtTrainerMetrics, vtTrainers, vtSessions, vtMembers, eq, desc, and, sql } from "@vt/db";

// GET weekly KPI data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weekEnding = searchParams.get("weekEnding");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Get payroll periods (weekly summaries)
    let periodsQuery = db
      .select()
      .from(vtPayrollPeriods)
      .orderBy(desc(vtPayrollPeriods.weekEnding))
      .limit(limit);

    const periods = await periodsQuery;

    // Get trainer metrics for the requested week(s)
    let metricsQuery;
    if (weekEnding) {
      metricsQuery = db
        .select({
          id: vtTrainerMetrics.id,
          trainerId: vtTrainerMetrics.trainerId,
          weekEnding: vtTrainerMetrics.weekEnding,
          activeMembers: vtTrainerMetrics.activeMembers,
          inactiveMembers: vtTrainerMetrics.inactiveMembers,
          churnedMembers: vtTrainerMetrics.churnedMembers,
          totalMembers: vtTrainerMetrics.totalMembers,
          referrals: vtTrainerMetrics.referrals,
          totalSessions: vtTrainerMetrics.totalSessions,
          earnings: vtTrainerMetrics.earnings,
          trainerFirstName: vtTrainers.firstName,
          trainerLastName: vtTrainers.lastName,
        })
        .from(vtTrainerMetrics)
        .leftJoin(vtTrainers, eq(vtTrainerMetrics.trainerId, vtTrainers.id))
        .where(eq(vtTrainerMetrics.weekEnding, weekEnding));
    } else {
      // Get latest week's metrics
      const [latestPeriod] = periods;
      if (latestPeriod) {
        metricsQuery = db
          .select({
            id: vtTrainerMetrics.id,
            trainerId: vtTrainerMetrics.trainerId,
            weekEnding: vtTrainerMetrics.weekEnding,
            activeMembers: vtTrainerMetrics.activeMembers,
            inactiveMembers: vtTrainerMetrics.inactiveMembers,
            churnedMembers: vtTrainerMetrics.churnedMembers,
            totalMembers: vtTrainerMetrics.totalMembers,
            referrals: vtTrainerMetrics.referrals,
            totalSessions: vtTrainerMetrics.totalSessions,
            earnings: vtTrainerMetrics.earnings,
            trainerFirstName: vtTrainers.firstName,
            trainerLastName: vtTrainers.lastName,
          })
          .from(vtTrainerMetrics)
          .leftJoin(vtTrainers, eq(vtTrainerMetrics.trainerId, vtTrainers.id))
          .where(eq(vtTrainerMetrics.weekEnding, latestPeriod.weekEnding));
      }
    }

    const trainerMetrics = metricsQuery ? await metricsQuery : [];

    // Transform trainer metrics
    const transformedMetrics = trainerMetrics.map((m) => ({
      ...m,
      trainer: {
        id: m.trainerId,
        firstName: m.trainerFirstName,
        lastName: m.trainerLastName,
      },
    }));

    return NextResponse.json({
      periods,
      trainerMetrics: transformedMetrics,
    });
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}

// POST - Calculate KPIs for a specific week
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekEnding, targetRevenue, goalSessions, fixedExpenses } = body;

    if (!weekEnding) {
      return NextResponse.json(
        { error: "weekEnding is required" },
        { status: 400 }
      );
    }

    // Calculate sessions for the week
    const sessionsResult = await db
      .select({
        trainerId: vtSessions.trainerId,
        totalSessions: sql<string>`SUM(CAST(${vtSessions.sessionValue} AS DECIMAL))`,
        totalRevenue: sql<number>`SUM(${vtSessions.priceCharged})`,
      })
      .from(vtSessions)
      .where(eq(vtSessions.weekEnding, weekEnding))
      .groupBy(vtSessions.trainerId);

    // Get all trainers with their rates
    const trainers = await db
      .select()
      .from(vtTrainers)
      .where(eq(vtTrainers.isActive, true));

    // Calculate totals
    let totalSessionsWeek = 0;
    let totalRevenueWeek = 0;
    let totalPayoutWeek = 0;

    const trainerBreakdown = trainers.map((trainer) => {
      const trainerSession = sessionsResult.find(
        (s) => s.trainerId === trainer.id
      );
      const sessions = trainerSession
        ? parseFloat(trainerSession.totalSessions || "0")
        : 0;
      const revenue = trainerSession?.totalRevenue || 0;
      const payout = sessions * trainer.sessionRate;

      totalSessionsWeek += sessions;
      totalRevenueWeek += revenue;
      totalPayoutWeek += payout;

      return {
        trainerId: trainer.id,
        trainerName: `${trainer.firstName} ${trainer.lastName}`,
        sessions,
        revenue,
        payout,
        sessionRate: trainer.sessionRate,
      };
    });

    // Calculate KPIs
    const targetRevenueValue = targetRevenue ? targetRevenue * 100 : 1500000; // Default $15k
    const goalSessionsValue = goalSessions || 200;
    const fixedExpensesValue = fixedExpenses ? fixedExpenses * 100 : 800000; // Default $8k

    const utilizationRate = totalSessionsWeek / goalSessionsValue;
    const totalExpenses = totalPayoutWeek + fixedExpensesValue;
    const netProfit = totalRevenueWeek - totalExpenses;
    const profitMargin = totalRevenueWeek > 0 ? netProfit / totalRevenueWeek : 0;
    const payoutRatio =
      totalRevenueWeek > 0 ? totalPayoutWeek / totalRevenueWeek : 0;

    // Upsert payroll period
    const [existingPeriod] = await db
      .select()
      .from(vtPayrollPeriods)
      .where(eq(vtPayrollPeriods.weekEnding, weekEnding))
      .limit(1);

    let periodId: string;

    if (existingPeriod) {
      await db
        .update(vtPayrollPeriods)
        .set({
          totalSessions: totalSessionsWeek.toFixed(2),
          goalSessions: goalSessionsValue,
          utilizationRate: utilizationRate.toFixed(4),
          totalRevenue: totalRevenueWeek,
          targetRevenue: targetRevenueValue,
          totalPayout: totalPayoutWeek,
          fixedExpenses: fixedExpensesValue,
          totalExpenses,
          netProfit,
          profitMargin: profitMargin.toFixed(4),
          payoutRatio: payoutRatio.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(vtPayrollPeriods.id, existingPeriod.id));
      periodId = existingPeriod.id;
    } else {
      const [newPeriod] = await db
        .insert(vtPayrollPeriods)
        .values({
          weekEnding,
          totalSessions: totalSessionsWeek.toFixed(2),
          goalSessions: goalSessionsValue,
          utilizationRate: utilizationRate.toFixed(4),
          totalRevenue: totalRevenueWeek,
          targetRevenue: targetRevenueValue,
          totalPayout: totalPayoutWeek,
          fixedExpenses: fixedExpensesValue,
          totalExpenses,
          netProfit,
          profitMargin: profitMargin.toFixed(4),
          payoutRatio: payoutRatio.toFixed(4),
          status: "draft",
        })
        .returning();
      periodId = newPeriod.id;
    }

    return NextResponse.json({
      success: true,
      period: {
        id: periodId,
        weekEnding,
        totalSessions: totalSessionsWeek,
        goalSessions: goalSessionsValue,
        utilizationRate,
        totalRevenue: totalRevenueWeek,
        targetRevenue: targetRevenueValue,
        totalPayout: totalPayoutWeek,
        fixedExpenses: fixedExpensesValue,
        totalExpenses,
        netProfit,
        profitMargin,
        payoutRatio,
      },
      trainerBreakdown,
    });
  } catch (error) {
    console.error("Error calculating KPIs:", error);
    return NextResponse.json(
      { error: "Failed to calculate KPIs" },
      { status: 500 }
    );
  }
}
