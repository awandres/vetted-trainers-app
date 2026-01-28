/**
 * Seed Dummy Session Data
 * 
 * This script creates realistic dummy session data for testing purposes.
 * All dummy data is marked with "[DUMMY DATA]" in the notes field.
 * 
 * Usage: npx dotenv -e .env -- npx tsx scripts/seed-dummy-sessions.ts
 */

import { db, vtSessions, vtMembers, vtTrainers, vtPayrollPeriods, eq, and, gte, lte, sql } from "@vt/db";

const DUMMY_DATA_MARKER = "[DUMMY DATA]";

// Helper to get the Saturday (week ending) for a given date
function getWeekEnding(date: Date): string {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  return d.toISOString().split("T")[0];
}

// Helper to generate a random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Session types with weights
const SESSION_TYPES = [
  { type: "in_gym", weight: 70 },
  { type: "virtual", weight: 15 },
  { type: "outdoor", weight: 10 },
  { type: "home", weight: 5 },
] as const;

function randomSessionType(): string {
  const total = SESSION_TYPES.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * total;
  for (const session of SESSION_TYPES) {
    random -= session.weight;
    if (random <= 0) return session.type;
  }
  return "in_gym";
}

// Session values with weights
const SESSION_VALUES = [
  { value: "1.0", weight: 80 },
  { value: "1.5", weight: 10 },
  { value: "0.5", weight: 10 },
];

function randomSessionValue(): string {
  const total = SESSION_VALUES.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * total;
  for (const session of SESSION_VALUES) {
    random -= session.weight;
    if (random <= 0) return session.value;
  }
  return "1.0";
}

async function seedDummySessions() {
  console.log("🌱 Seeding dummy session data...\n");

  // Get all trainers
  const trainers = await db.select().from(vtTrainers);
  console.log(`Found ${trainers.length} trainers`);

  if (trainers.length === 0) {
    console.error("❌ No trainers found. Please run the data import first.");
    process.exit(1);
  }

  // Get active members with assigned trainers
  const members = await db
    .select()
    .from(vtMembers)
    .where(eq(vtMembers.status, "active"));
  
  console.log(`Found ${members.length} active members`);

  // If not enough active members, get some inactive ones too
  let allMembers = members;
  if (members.length < 20) {
    const inactiveMembers = await db
      .select()
      .from(vtMembers)
      .where(eq(vtMembers.status, "inactive"));
    allMembers = [...members, ...inactiveMembers.slice(0, 50)];
    console.log(`Added ${allMembers.length - members.length} inactive members for testing`);
  }

  // Generate sessions for the past 12 weeks
  const today = new Date();
  const weeksToGenerate = 12;
  const sessionsPerWeek = Math.floor(allMembers.length * 2.5); // ~2.5 sessions per member per week on average
  
  console.log(`\nGenerating ~${sessionsPerWeek} sessions per week for ${weeksToGenerate} weeks...`);

  let totalSessions = 0;
  const weeklyStats: Record<string, { sessions: number; revenue: number }> = {};

  for (let week = 0; week < weeksToGenerate; week++) {
    // Calculate week dates
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (week * 7) - today.getDay()); // Start of this week (Sunday)
    weekStart.setDate(weekStart.getDate() - 7); // Go back one more week
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday
    
    const weekEnding = getWeekEnding(weekEnd);
    
    // Skip future weeks
    if (new Date(weekEnding) > today) continue;
    
    // Random variation in sessions per week (80% - 120%)
    const weekVariation = 0.8 + Math.random() * 0.4;
    const sessionsThisWeek = Math.floor(sessionsPerWeek * weekVariation);
    
    let weekRevenue = 0;
    const sessionsToInsert = [];

    for (let i = 0; i < sessionsThisWeek; i++) {
      // Pick a random member and trainer
      const member = allMembers[Math.floor(Math.random() * allMembers.length)];
      const trainer = member.trainerId 
        ? trainers.find(t => t.id === member.trainerId) || trainers[Math.floor(Math.random() * trainers.length)]
        : trainers[Math.floor(Math.random() * trainers.length)];
      
      // Generate session date within the week
      const sessionDate = randomDate(weekStart, weekEnd);
      
      // Calculate price (based on session type and member's contract)
      const basePrice = 7500; // $75 base price
      const priceVariation = Math.floor(Math.random() * 2500) - 1250; // +/- $12.50
      const priceCharged = basePrice + priceVariation;
      
      weekRevenue += priceCharged;
      
      sessionsToInsert.push({
        memberId: member.id,
        trainerId: trainer.id,
        sessionDate: sessionDate.toISOString().split("T")[0],
        sessionType: randomSessionType(),
        sessionValue: randomSessionValue(),
        priceCharged,
        weekEnding,
        notes: `${DUMMY_DATA_MARKER} Auto-generated test session`,
      });
    }

    // Batch insert sessions
    if (sessionsToInsert.length > 0) {
      await db.insert(vtSessions).values(sessionsToInsert);
      totalSessions += sessionsToInsert.length;
      weeklyStats[weekEnding] = { sessions: sessionsToInsert.length, revenue: weekRevenue };
      console.log(`  Week ending ${weekEnding}: ${sessionsToInsert.length} sessions, $${(weekRevenue / 100).toFixed(2)} revenue`);
    }
  }

  console.log(`\n✅ Created ${totalSessions} dummy sessions across ${Object.keys(weeklyStats).length} weeks`);

  // Update member lastVisitDate based on most recent session
  console.log("\n📊 Updating member last visit dates...");
  
  const memberSessions = await db
    .select({
      memberId: vtSessions.memberId,
      lastSession: sql<string>`MAX(${vtSessions.sessionDate})`,
    })
    .from(vtSessions)
    .where(sql`${vtSessions.notes} LIKE ${`%${DUMMY_DATA_MARKER}%`}`)
    .groupBy(vtSessions.memberId);

  for (const { memberId, lastSession } of memberSessions) {
    if (memberId && lastSession) {
      await db
        .update(vtMembers)
        .set({ lastVisitDate: lastSession })
        .where(eq(vtMembers.id, memberId));
    }
  }

  console.log(`Updated ${memberSessions.length} member records`);

  // Update or create payroll periods with session totals
  console.log("\n💰 Updating payroll periods...");
  
  for (const [weekEnding, stats] of Object.entries(weeklyStats)) {
    // Check if period exists
    const [existingPeriod] = await db
      .select()
      .from(vtPayrollPeriods)
      .where(eq(vtPayrollPeriods.weekEnding, weekEnding));

    const newTotalSessions = (parseFloat(existingPeriod?.totalSessions || "0") + stats.sessions).toString();
    const newTotalRevenue = (existingPeriod?.totalRevenue || 0) + stats.revenue;
    
    // Estimate payout (60% of revenue)
    const newTotalPayout = Math.floor(newTotalRevenue * 0.6);
    const fixedExpenses = existingPeriod?.fixedExpenses || 800000; // $8000 default
    const netProfit = newTotalRevenue - newTotalPayout - fixedExpenses;
    const profitMargin = newTotalRevenue > 0 ? (netProfit / newTotalRevenue).toFixed(4) : "0";

    if (existingPeriod) {
      await db
        .update(vtPayrollPeriods)
        .set({
          totalSessions: newTotalSessions,
          totalRevenue: newTotalRevenue,
          totalPayout: newTotalPayout,
          netProfit,
          profitMargin,
          utilizationRate: (stats.sessions / 436).toFixed(4), // 436 = goal sessions
        })
        .where(eq(vtPayrollPeriods.id, existingPeriod.id));
    } else {
      await db.insert(vtPayrollPeriods).values({
        weekEnding,
        totalSessions: newTotalSessions,
        goalSessions: 436,
        totalRevenue: newTotalRevenue,
        targetRevenue: 2500000, // $25,000
        totalPayout: newTotalPayout,
        fixedExpenses: 800000,
        totalExpenses: newTotalPayout + 800000,
        netProfit,
        profitMargin,
        utilizationRate: (stats.sessions / 436).toFixed(4),
        status: "draft",
      });
    }
  }

  console.log(`Updated ${Object.keys(weeklyStats).length} payroll periods`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DUMMY DATA SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total sessions created: ${totalSessions}`);
  console.log(`Weeks covered: ${Object.keys(weeklyStats).length}`);
  console.log(`Member records updated: ${memberSessions.length}`);
  console.log(`\n⚠️  All dummy data is marked with "${DUMMY_DATA_MARKER}" in the notes field.`);
  console.log(`To remove dummy data, run: DELETE FROM vt_sessions WHERE notes LIKE '%${DUMMY_DATA_MARKER}%'`);
  console.log("=".repeat(60));
}

// Run the script
seedDummySessions()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
