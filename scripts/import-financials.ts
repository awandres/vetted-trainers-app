/**
 * Import Financials Data from CSV
 * Run with: npx dotenv -e .env -- npx tsx scripts/import-financials.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../packages/db/src/schema";

const { vtPayrollPeriods } = schema;

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const DATA_DIR = join(process.cwd(), "data");
const FINANCIALS_FILE = join(DATA_DIR, "Vetted Trainers Data  - Financials 2026.csv");

// ID generator
function createId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Parse dollar amount to cents
function parseDollarsToCents(str: string): number | null {
  if (!str || str === "" || str === "#DIV/0!" || str === "-") return null;
  const cleaned = str.replace(/[$,]/g, "").replace(/\(([^)]+)\)/, "-$1");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}

// Parse percentage to decimal
function parsePercentage(str: string): number | null {
  if (!str || str === "" || str === "#DIV/0!" || str === "-") return null;
  const cleaned = str.replace("%", "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num / 100;
}

// Parse number
function parseNumber(str: string): number | null {
  if (!str || str === "" || str === "#DIV/0!" || str === "-") return null;
  const num = parseFloat(str);
  if (isNaN(num)) return null;
  return num;
}

// Parse date to YYYY-MM-DD
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr === "") return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function importFinancials() {
  console.log("💰 Importing Financials Data\n");

  if (!existsSync(FINANCIALS_FILE)) {
    console.error(`File not found: ${FINANCIALS_FILE}`);
    process.exit(1);
  }

  const content = readFileSync(FINANCIALS_FILE, "utf-8");
  const lines = content.split("\n").map(line => line.split(",").map(cell => cell.trim()));

  // Header row is line 0
  // Data starts at line 1
  // Columns (by index):
  // 0: Metrics label, 1: YTD value, 7: Week Ending, 8: Total Sessions, 9: 8 wk Avg,
  // 10: Goal Sessions, 11: Utilization %, 12: S2S Revenue, 13: CM Revenue,
  // 14: Total Revenue, 15: Rev/Session, 16: Target Revenue, 17: Total Payout,
  // 18: Fixed Expenses, 19: Total Expenses, 20: Net Profit, 21: Profit Margin, 22: Payout Ratio

  let updated = 0;
  let created = 0;

  // Process weekly data (starting from row 1)
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row[7]) continue; // Skip if no week ending date

    const weekEnding = parseDate(row[7]);
    if (!weekEnding) continue;

    const totalSessions = parseNumber(row[8]);
    const goalSessions = parseNumber(row[10]);
    const utilizationRate = parsePercentage(row[11]);
    const s2sRevenue = parseDollarsToCents(row[12]);
    const cmRevenue = parseDollarsToCents(row[13]);
    const totalRevenue = parseDollarsToCents(row[14]);
    const targetRevenue = parseDollarsToCents(row[16]);
    const totalPayout = parseDollarsToCents(row[17]);
    const fixedExpenses = parseDollarsToCents(row[18]);
    const totalExpenses = parseDollarsToCents(row[19]);
    const netProfit = parseDollarsToCents(row[20]);
    const profitMargin = parsePercentage(row[21]);
    const payoutRatio = parsePercentage(row[22]);

    // Skip rows without actual data (future weeks)
    if (totalSessions === null && totalRevenue === null) continue;

    // Check if period exists
    const [existing] = await db
      .select()
      .from(vtPayrollPeriods)
      .where(eq(vtPayrollPeriods.weekEnding, weekEnding))
      .limit(1);

    if (existing) {
      // Update with financial data
      await db
        .update(vtPayrollPeriods)
        .set({
          totalSessions: totalSessions?.toFixed(2) || existing.totalSessions,
          goalSessions: goalSessions || existing.goalSessions,
          utilizationRate: utilizationRate?.toFixed(4) || existing.utilizationRate,
          totalRevenue: totalRevenue || existing.totalRevenue,
          targetRevenue: targetRevenue || existing.targetRevenue,
          totalPayout: totalPayout || existing.totalPayout,
          fixedExpenses: fixedExpenses || existing.fixedExpenses,
          totalExpenses: totalExpenses || existing.totalExpenses,
          netProfit: netProfit || existing.netProfit,
          profitMargin: profitMargin?.toFixed(4) || existing.profitMargin,
          payoutRatio: payoutRatio?.toFixed(4) || existing.payoutRatio,
          updatedAt: new Date(),
        })
        .where(eq(vtPayrollPeriods.id, existing.id));
      updated++;
      console.log(`   🔄 Updated: ${weekEnding}`);
    } else {
      // Create new period with financial data
      await db.insert(vtPayrollPeriods).values({
        id: createId(),
        weekEnding,
        totalSessions: totalSessions?.toFixed(2) || "0",
        goalSessions: goalSessions || 200,
        utilizationRate: utilizationRate?.toFixed(4) || "0",
        totalRevenue: totalRevenue || 0,
        targetRevenue: targetRevenue || 2500000,
        totalPayout: totalPayout || 0,
        fixedExpenses: fixedExpenses || 164835,
        totalExpenses: totalExpenses || 0,
        netProfit: netProfit || 0,
        profitMargin: profitMargin?.toFixed(4) || "0",
        payoutRatio: payoutRatio?.toFixed(4) || "0",
        status: totalRevenue ? "final" : "draft",
      });
      created++;
      console.log(`   ✓ Created: ${weekEnding}`);
    }
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("📊 Import Summary");
  console.log("═══════════════════════════════════════════");
  console.log(`   Updated:  ${updated}`);
  console.log(`   Created:  ${created}`);
  console.log("═══════════════════════════════════════════\n");

  console.log("✅ Financials import complete!");
}

importFinancials()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
