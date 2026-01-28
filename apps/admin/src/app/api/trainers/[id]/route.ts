import { NextRequest, NextResponse } from "next/server";
import { db, vtTrainers, vtMembers, vtSessions, vtTrainerMetrics, eq, desc, sql, and, gte } from "@vt/db";

// GET single trainer with details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch trainer
        const trainer = await db
            .select()
            .from(vtTrainers)
            .where(eq(vtTrainers.id, id))
            .limit(1);

        if (!trainer[0]) {
            return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
        }

        // Fetch assigned members with counts by status
        const members = await db
            .select({
                id: vtMembers.id,
                firstName: vtMembers.firstName,
                lastName: vtMembers.lastName,
                status: vtMembers.status,
                lastVisitDate: vtMembers.lastVisitDate,
                daysSinceVisit: vtMembers.daysSinceVisit,
                pricePerSession: vtMembers.pricePerSession,
            })
            .from(vtMembers)
            .where(eq(vtMembers.trainerId, id))
            .orderBy(vtMembers.lastName);

        // Calculate member stats
        const memberStats = {
            total: members.length,
            active: members.filter((m) => m.status === "active").length,
            inactive: members.filter((m) => m.status === "inactive").length,
            churned: members.filter((m) => m.status === "churned").length,
            paused: members.filter((m) => m.status === "paused").length,
        };

        // Calculate average price per session
        const avgPrice = members.length > 0
            ? members.reduce((sum, m) => sum + (m.pricePerSession || 0), 0) / members.length
            : 0;

        // Fetch recent sessions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

        const recentSessions = await db
            .select({
                id: vtSessions.id,
                sessionDate: vtSessions.sessionDate,
                sessionType: vtSessions.sessionType,
                sessionValue: vtSessions.sessionValue,
                priceCharged: vtSessions.priceCharged,
                memberId: vtSessions.memberId,
                memberFirstName: vtMembers.firstName,
                memberLastName: vtMembers.lastName,
            })
            .from(vtSessions)
            .leftJoin(vtMembers, eq(vtSessions.memberId, vtMembers.id))
            .where(
                and(
                    eq(vtSessions.trainerId, id),
                    gte(vtSessions.sessionDate, thirtyDaysAgoStr)
                )
            )
            .orderBy(desc(vtSessions.sessionDate))
            .limit(50);

        // Calculate session stats
        const sessionStats = {
            last30Days: recentSessions.reduce((sum, s) => sum + parseFloat(s.sessionValue || "1"), 0),
            totalRevenue: recentSessions.reduce((sum, s) => sum + (s.priceCharged || 0), 0),
        };

        // Fetch recent metrics
        const metrics = await db
            .select()
            .from(vtTrainerMetrics)
            .where(eq(vtTrainerMetrics.trainerId, id))
            .orderBy(desc(vtTrainerMetrics.weekEnding))
            .limit(12);

        // Calculate retention rate
        const retentionRate = memberStats.total > 0
            ? memberStats.active / memberStats.total
            : 0;

        return NextResponse.json({
            trainer: trainer[0],
            members,
            memberStats,
            avgPricePerSession: avgPrice,
            retentionRate,
            recentSessions,
            sessionStats,
            metrics,
        });
    } catch (error) {
        console.error("Error fetching trainer:", error);
        return NextResponse.json(
            { error: "Failed to fetch trainer" },
            { status: 500 }
        );
    }
}

// PUT update trainer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        // Only update fields that are provided
        if (body.firstName !== undefined) updateData.firstName = body.firstName;
        if (body.lastName !== undefined) updateData.lastName = body.lastName;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.sessionRate !== undefined) updateData.sessionRate = Math.round(body.sessionRate * 100);
        if (body.nonSessionRate !== undefined) updateData.nonSessionRate = Math.round(body.nonSessionRate * 100);
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.bio !== undefined) updateData.bio = body.bio;
        if (body.goalSessions !== undefined) updateData.goalSessions = body.goalSessions;
        if (body.lastRaiseDate !== undefined) updateData.lastRaiseDate = body.lastRaiseDate;

        const [updated] = await db
            .update(vtTrainers)
            .set(updateData)
            .where(eq(vtTrainers.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
        }

        return NextResponse.json({ trainer: updated });
    } catch (error) {
        console.error("Error updating trainer:", error);
        return NextResponse.json(
            { error: "Failed to update trainer" },
            { status: 500 }
        );
    }
}
