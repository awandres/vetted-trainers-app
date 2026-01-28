/**
 * Import KPI/Weekly Session Data from CSV
 * Run with: npx dotenv -e .env -- npx tsx scripts/import-kpi-data.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../packages/db/src/schema";

const { vtTrainers, vtPayrollPeriods, vtPayrollDetails, vtTrainerMetrics } = schema;

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const DATA_DIR = join(process.cwd(), "data");
const KPI_FILE = join(DATA_DIR, "Vetted Trainers Data  - KPI 2026.csv");

// ID generator
function createId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Normalize name for matching
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Parse the KPI CSV which has a unique structure
function parseKPICSV(filePath: string): { weekEnding: string; data: Map<string, any> }[] {
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").map(line => line.split(",").map(cell => cell.trim()));
  
  const weeks: { weekEnding: string; data: Map<string, any> }[] = [];
  let currentWeek: { weekEnding: string; data: Map<string, any> } | null = null;
  let trainerColumns: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line[0]) continue;
    
    // Check for week header
    if (line[0].startsWith("Week Ending:")) {
      // Save previous week if exists
      if (currentWeek) {
        weeks.push(currentWeek);
      }
      
      // Parse date from "Week Ending: 1/4" format
      const dateStr = line[0].replace("Week Ending:", "").trim();
      const [month, day] = dateStr.split("/");
      const year = 2026; // Assuming 2026 based on file name
      const weekEnding = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      
      currentWeek = {
        weekEnding,
        data: new Map(),
      };
      continue;
    }
    
    if (!currentWeek) continue;
    
    // Parse row type
    const rowType = line[0];
    
    // Team totals
    if (rowType === "Team Total Sessions") {
      currentWeek.data.set("teamTotalSessions", parseFloat(line[1]) || 0);
    } else if (rowType === "Team Goal Sessions") {
      currentWeek.data.set("teamGoalSessions", parseFloat(line[1]) || 0);
    } else if (rowType === "Team Utilization Rate") {
      const rate = line[1].replace("%", "");
      currentWeek.data.set("teamUtilizationRate", parseFloat(rate) / 100 || 0);
    }
    
    // Trainer header row
    if (rowType === "Trainer") {
      trainerColumns = line.slice(1).filter(name => name);
      currentWeek.data.set("trainers", trainerColumns);
    }
    
    // Total Sessions per trainer
    if (rowType === "Total Sessions") {
      const sessions: Record<string, number> = {};
      for (let j = 0; j < trainerColumns.length && j < line.length - 1; j++) {
        const val = line[j + 1];
        sessions[trainerColumns[j]] = val && val !== "-" ? parseFloat(val) : 0;
      }
      currentWeek.data.set("trainerSessions", sessions);
    }
    
    // Goal Sessions per trainer
    if (rowType === "Goal Sessions") {
      const goals: Record<string, number> = {};
      for (let j = 0; j < trainerColumns.length && j < line.length - 1; j++) {
        const val = line[j + 1];
        goals[trainerColumns[j]] = val && val !== "-" ? parseFloat(val) : 0;
      }
      currentWeek.data.set("trainerGoals", goals);
    }
    
    // Total Non-Session Hours
    if (rowType === "Total Non-Session Hours") {
      const nonSession: Record<string, number> = {};
      for (let j = 0; j < trainerColumns.length && j < line.length - 1; j++) {
        const val = line[j + 1];
        nonSession[trainerColumns[j]] = val && val !== "-" ? parseFloat(val) : 0;
      }
      currentWeek.data.set("trainerNonSessionHours", nonSession);
    }
    
    // Total Hours Worked
    if (rowType === "Total Hours Worked") {
      const hoursWorked: Record<string, number> = {};
      for (let j = 0; j < trainerColumns.length && j < line.length - 1; j++) {
        const val = line[j + 1];
        hoursWorked[trainerColumns[j]] = val && val !== "-" ? parseFloat(val) : 0;
      }
      currentWeek.data.set("trainerHoursWorked", hoursWorked);
    }
  }
  
  // Don't forget the last week
  if (currentWeek) {
    weeks.push(currentWeek);
  }
  
  return weeks;
}

async function importKPIData() {
  console.log("📊 Importing KPI Data\n");
  
  // Step 1: Get all trainers for name matching
  console.log("📋 Loading trainers...");
  const trainers = await db.select().from(vtTrainers);
  
  const trainerMap = new Map<string, typeof trainers[0]>();
  for (const t of trainers) {
    const fullName = normalizeName(`${t.firstName}${t.lastName}`);
    trainerMap.set(fullName, t);
    // Also map first name only
    if (t.firstName) {
      trainerMap.set(normalizeName(t.firstName), t);
    }
  }
  
  console.log(`   Found ${trainers.length} trainers`);
  
  // Step 2: Parse KPI CSV
  console.log("\n📥 Parsing KPI CSV...");
  const weeks = parseKPICSV(KPI_FILE);
  console.log(`   Found ${weeks.length} weeks of data`);
  
  // Step 3: Import each week
  let periodsCreated = 0;
  let detailsCreated = 0;
  
  for (const week of weeks) {
    console.log(`\n📅 Processing week ending ${week.weekEnding}...`);
    
    const teamTotalSessions = week.data.get("teamTotalSessions") || 0;
    const teamGoalSessions = week.data.get("teamGoalSessions") || 0;
    const teamUtilizationRate = week.data.get("teamUtilizationRate") || 0;
    const trainerSessions = week.data.get("trainerSessions") || {};
    const trainerGoals = week.data.get("trainerGoals") || {};
    const trainerNonSessionHours = week.data.get("trainerNonSessionHours") || {};
    
    // Check if period already exists
    const [existingPeriod] = await db
      .select()
      .from(vtPayrollPeriods)
      .where(eq(vtPayrollPeriods.weekEnding, week.weekEnding))
      .limit(1);
    
    let periodId: string;
    
    // Estimate revenue based on average price per session ($75)
    const avgPricePerSession = 7500; // $75.00 in cents
    const estimatedRevenue = Math.round(teamTotalSessions * avgPricePerSession);
    
    // Fixed expenses (default $8000)
    const fixedExpenses = 800000;
    
    // Calculate payout based on trainer sessions and rates
    let totalPayout = 0;
    for (const [trainerName, sessions] of Object.entries(trainerSessions)) {
      const trainer = trainerMap.get(normalizeName(trainerName));
      if (trainer) {
        totalPayout += (sessions as number) * (trainer.sessionRate || 4000);
      }
    }
    
    // Add non-session hour pay
    for (const [trainerName, hours] of Object.entries(trainerNonSessionHours)) {
      const trainer = trainerMap.get(normalizeName(trainerName));
      if (trainer) {
        totalPayout += (hours as number) * (trainer.nonSessionRate || 4000);
      }
    }
    
    const totalExpenses = totalPayout + fixedExpenses;
    const netProfit = estimatedRevenue - totalExpenses;
    const profitMargin = estimatedRevenue > 0 ? netProfit / estimatedRevenue : 0;
    
    if (existingPeriod) {
      // Update existing period
      await db
        .update(vtPayrollPeriods)
        .set({
          totalSessions: teamTotalSessions.toFixed(2),
          goalSessions: teamGoalSessions,
          utilizationRate: teamUtilizationRate.toFixed(4),
          totalRevenue: estimatedRevenue,
          targetRevenue: 1500000, // $15,000 target
          totalPayout,
          fixedExpenses,
          totalExpenses,
          netProfit,
          profitMargin: profitMargin.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(vtPayrollPeriods.id, existingPeriod.id));
      periodId = existingPeriod.id;
      console.log(`   🔄 Updated period: ${week.weekEnding}`);
    } else {
      // Create new period
      periodId = createId();
      await db.insert(vtPayrollPeriods).values({
        id: periodId,
        weekEnding: week.weekEnding,
        totalSessions: teamTotalSessions.toFixed(2),
        goalSessions: teamGoalSessions,
        utilizationRate: teamUtilizationRate.toFixed(4),
        totalRevenue: estimatedRevenue,
        targetRevenue: 1500000, // $15,000
        totalPayout,
        fixedExpenses,
        totalExpenses,
        netProfit,
        profitMargin: profitMargin.toFixed(4),
        payoutRatio: estimatedRevenue > 0 ? (totalPayout / estimatedRevenue).toFixed(4) : "0",
        status: "final",
      });
      periodsCreated++;
      console.log(`   ✓ Created period: ${week.weekEnding}`);
    }
    
    // Create/update payroll details for each trainer
    for (const [trainerName, sessions] of Object.entries(trainerSessions)) {
      const trainer = trainerMap.get(normalizeName(trainerName));
      if (!trainer) {
        console.log(`   ⚠️  Trainer not found: ${trainerName}`);
        continue;
      }
      
      const goalSessions = trainerGoals[trainerName] || 0;
      const nonSessionHours = trainerNonSessionHours[trainerName] || 0;
      const sessionPay = (sessions as number) * (trainer.sessionRate || 4000);
      const nonSessionPay = (nonSessionHours as number) * (trainer.nonSessionRate || 4000);
      const totalPay = sessionPay + nonSessionPay;
      const utilization = goalSessions > 0 ? (sessions as number) / goalSessions : 0;
      
      // Check if detail exists
      const [existingDetail] = await db
        .select()
        .from(vtPayrollDetails)
        .where(
          and(
            eq(vtPayrollDetails.payrollPeriodId, periodId),
            eq(vtPayrollDetails.trainerId, trainer.id)
          )
        )
        .limit(1);
      
      if (existingDetail) {
        await db
          .update(vtPayrollDetails)
          .set({
            totalSessions: (sessions as number).toFixed(2),
            goalSessions,
            utilizationRate: utilization.toFixed(4),
            nonSessionHours: (nonSessionHours as number).toFixed(2),
            sessionRate: trainer.sessionRate,
            sessionPaySubtotal: sessionPay,
            nonSessionRate: trainer.nonSessionRate,
            nonSessionPaySubtotal: nonSessionPay,
            totalPay,
          })
          .where(eq(vtPayrollDetails.id, existingDetail.id));
      } else {
        await db.insert(vtPayrollDetails).values({
          id: createId(),
          payrollPeriodId: periodId,
          trainerId: trainer.id,
          totalSessions: (sessions as number).toFixed(2),
          goalSessions,
          utilizationRate: utilization.toFixed(4),
          nonSessionHours: (nonSessionHours as number).toFixed(2),
          sessionRate: trainer.sessionRate,
          sessionPaySubtotal: sessionPay,
          nonSessionRate: trainer.nonSessionRate,
          nonSessionPaySubtotal: nonSessionPay,
          totalPay,
        });
        detailsCreated++;
      }
    }
    
    console.log(`   ✓ Processed ${Object.keys(trainerSessions).length} trainer entries`);
  }
  
  console.log("\n═══════════════════════════════════════════");
  console.log("📊 Import Summary");
  console.log("═══════════════════════════════════════════");
  console.log(`   Periods created:  ${periodsCreated}`);
  console.log(`   Details created:  ${detailsCreated}`);
  console.log("═══════════════════════════════════════════\n");
  
  console.log("✅ KPI data import complete!");
}

importKPIData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
