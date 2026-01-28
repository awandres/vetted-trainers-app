/**
 * VT Data Import Script
 * Imports all Vetted Trainers data from CSV files into the database
 * 
 * Run with: pnpm seed
 * 
 * CSV files expected in: ./data/
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { parse } from "csv-parse/sync";
import { join } from "path";
import * as schema from "../packages/db/src/schema";

const {
  vtTrainers,
  vtMembers,
  vtContracts,
  vtExercises,
  vtPrescriptions,
  vtPrescriptionExercises,
  vtTasks,
} = schema;

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Data folder path (relative to project root)
const DATA_DIR = join(process.cwd(), "data");

// CSV file paths
const CSV_FILES = {
  memberTracker: join(DATA_DIR, "Vetted Trainers Data  - Member Tracker 2026.csv"),
  trainerMetrics: join(DATA_DIR, "Vetted Trainers Data  - Trainer Metrics 2026.csv"),
  movementLibrary: join(DATA_DIR, "Vetted Trainers Data  - Movement Library.csv"),
  mobilityPrescriptions: join(DATA_DIR, "Vetted Trainers Data  - Mobility Prescriptions.csv"),
  newMembers: join(DATA_DIR, "Vetted Trainers Data  - New Members 2025.csv"),
  commandCenter: join(DATA_DIR, "Vetted Trainers Data  - VT Command Center.csv"),
  visits: join(DATA_DIR, "Vetted Trainers Data  - Visits 2026.csv"),
};

// ID generator
function createId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Parse CSV file
function parseCSV(filePath: string): Record<string, string>[] {
  if (!existsSync(filePath)) {
    console.warn(`   ⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
}

// Parse Member Tracker CSV with explicit column indices (has duplicate "Trainer" columns)
function parseMemberTrackerCSV(filePath: string): {
  lastVisit: string;
  member: string;
  trainer: string;
  pricePerSession: string;
  email: string;
  daysSince: string;
  referredBy: string;
}[] {
  if (!existsSync(filePath)) {
    console.warn(`   ⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  // Parse without column headers since there are duplicate column names
  const rows = parse(content, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    from_line: 2, // Skip header row
  }) as string[][];

  // Map to objects using column indices:
  // 0: Last Visit, 1: Member, 2: Trainer (first instance), 3: Price per Session, 4: Email, 5: Days Since
  return rows.map((row: string[]) => ({
    lastVisit: row[0] || "",
    member: row[1] || "",
    trainer: row[2] || "",  // The FIRST Trainer column (index 2)
    pricePerSession: row[3] || "",
    email: row[4] || "",
    daysSince: row[5] || "",
    referredBy: "", // Not in current CSV position
  }));
}

// Convert price string to cents
function priceToCents(priceStr: string | undefined): number | null {
  if (!priceStr || priceStr === "N/A" || priceStr === "" || priceStr === "-") return null;
  const cleaned = priceStr.replace(/[$,]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}

// Parse date from various formats
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr === "" || dateStr === "N/A" || dateStr === "-") return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

// Normalize name for matching
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Parse percentage string to decimal
function parsePercentage(str: string | undefined): string | null {
  if (!str || str === "" || str === "N/A") return null;
  const cleaned = str.replace("%", "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return (num / 100).toFixed(4);
}

// Parse New Members CSV - complex structure with repeating headers
function parseNewMembersCSV(filePath: string): {
  member: string;
  programType: string;
  lengthWeeks: string;
  price: string;
  weeklySessions: string;
  startDate: string;
  endDate: string;
  totalValue: string;
  commission: string;
  commissionTotal: string;
  initialTrainer: string;
  enrollmentFee: string;
  contractStatus: string;
  alertStatus: string;
}[] {
  if (!existsSync(filePath)) {
    console.warn(`   ⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  
  // Parse without column headers since the structure is complex
  const allRows = parse(content, {
    columns: false,
    skip_empty_lines: false,
    trim: true,
    relax_column_count: true,
  }) as string[][];

  const results: {
    member: string;
    programType: string;
    lengthWeeks: string;
    price: string;
    weeklySessions: string;
    startDate: string;
    endDate: string;
    totalValue: string;
    commission: string;
    commissionTotal: string;
    initialTrainer: string;
    enrollmentFee: string;
    contractStatus: string;
    alertStatus: string;
  }[] = [];

  // Process each row
  for (const row of allRows) {
    const firstCell = (row[0] || "").trim();
    
    // Skip empty rows
    if (!firstCell) continue;
    
    // Skip header rows and summary rows
    if (firstCell === "Member") continue; // Header row
    if (firstCell.startsWith("Week Ending")) continue; // Week section header
    if (firstCell === "Sales Commission") continue; // Summary row
    if (firstCell.includes("YTD Commission")) continue; // YTD summary
    
    // Skip rows where first cell is just a comma or whitespace
    if (firstCell === "" || firstCell === ",") continue;
    
    // This should be an actual member row
    // Column indices based on the header:
    // 0: Member, 1: Program Type, 2: Program Length (Weeks), 3: Program Price,
    // 4: Weekly Sessions, 5: Contract Start Date, 6: Contract End Date,
    // 7: Monetary Total, 8: Commission, 9: Total, 10: Initial Trainer,
    // 11: Enrollment Fee, 12: Contract Status, 13: Alert Status
    
    results.push({
      member: row[0] || "",
      programType: row[1] || "",
      lengthWeeks: row[2] || "",
      price: row[3] || "",
      weeklySessions: row[4] || "",
      startDate: row[5] || "",
      endDate: row[6] || "",
      totalValue: row[7] || "",
      commission: row[8] || "",
      commissionTotal: row[9] || "",
      initialTrainer: row[10] || "",
      enrollmentFee: row[11] || "",
      contractStatus: row[12] || "",
      alertStatus: row[13] || "",
    });
  }

  return results;
}

// Trainer name aliases
const TRAINER_ALIASES: Record<string, string> = {
  "matt albano": "Matthew Albano",
  "matthew": "Matthew Albano",
  "joey": "Joey Bomango",
  "jose": "Jose Recio",
  "kade": "Kade Arrington",
  "nick": "Nick Rispoli",
  "shane": "Shane Mullen",
  "ben": "Ben Sicat",
  "lex": "Lex Titus",
  "tony": "Tony Bianchini",
  "youssef": "Youssef Salem",
  "michael": "Michael Coleman",
  "jae": "Jae Blanc",
  "luke": "Luke Boyd",
  "will": "Will Albritton",
  "joel": "Joel Arias",
  "shane ": "Shane Mullen",
  "joey/kade": "Joey Bomango",
};

// Get full trainer name from partial/alias
function normalizeTrainerName(name: string | undefined): string | null {
  if (!name || name === "" || name === "-" || name === "none" || name === "N/A") return null;
  const lower = name.toLowerCase().trim();
  return TRAINER_ALIASES[lower] || name.trim();
}

// Member status based on days since last visit
function getMemberStatus(daysSince: number | null): "active" | "inactive" | "churned" {
  if (daysSince === null) return "active";
  if (daysSince <= 14) return "active";
  if (daysSince <= 45) return "inactive";
  return "churned";
}

// Contract type mapping
function getContractType(programType: string): "training_agreement" | "price_lock" | "session_to_session" {
  const lower = programType.toLowerCase();
  if (lower.includes("training agreement")) return "training_agreement";
  if (lower.includes("price lock")) return "price_lock";
  return "session_to_session";
}

// Commission rate by contract type
function getCommissionRate(contractType: string): string {
  if (contractType === "training_agreement") return "0.05";
  if (contractType === "price_lock") return "0.025";
  return "0";
}

// Task priority mapping
function getTaskPriority(priority: string | undefined): "high" | "medium" | "low" | null {
  if (!priority) return null;
  const lower = priority.toLowerCase();
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  if (lower === "low") return "low";
  return null;
}

// Task status mapping
function getTaskStatus(status: string | undefined): "not_started" | "in_progress" | "upcoming" | "done" {
  if (!status) return "not_started";
  const lower = status.toLowerCase();
  if (lower === "done") return "done";
  if (lower === "in progress") return "in_progress";
  if (lower === "upcoming") return "upcoming";
  return "not_started";
}

// Exercise category from section header or name
function getExerciseCategory(name: string, currentSection: string): "release" | "stretch" | "sequence" | "activation" | "mobility" {
  const lowerName = name.toLowerCase();
  const lowerSection = currentSection.toLowerCase();

  if (lowerSection.includes("release") || lowerName.includes("release")) return "release";
  if (lowerSection.includes("stretch") || lowerName.includes("stretch")) return "stretch";
  if (lowerName.includes("sequence")) return "sequence";
  if (lowerSection.includes("movement") || lowerName.includes("movement")) return "mobility";

  return "mobility";
}

async function importData() {
  console.log("🚀 Starting VT Data Import");
  console.log(`📁 Data directory: ${DATA_DIR}\n`);

  // =========================================================================
  // STEP 1: Import Trainers from Trainer Metrics
  // =========================================================================
  console.log("📥 Step 1: Importing Trainers from Trainer Metrics...");

  const trainerMap = new Map<string, string>(); // name -> id

  try {
    const trainerData = parseCSV(CSV_FILES.trainerMetrics);

    for (const row of trainerData) {
      const trainerName = row["Trainer"];
      if (!trainerName || trainerName === "" || trainerName === "Total") continue;

      const [first, ...lastParts] = trainerName.split(" ");
      const lastName = lastParts.join(" ");

      // Parse rates from CSV
      const sessionRateStr = row["Current Session Rate"];
      const nonSessionRateStr = row["Current Non-Session Rate"];
      const sessionRate = sessionRateStr ? parseInt(sessionRateStr) * 100 : 3000; // Convert to cents
      const nonSessionRate = nonSessionRateStr ? parseInt(nonSessionRateStr) * 100 : 3000;

      // Parse dates
      const lastRaiseDate = parseDate(row["Last Raise Date (Manual Input)"]);

      // Check if trainer already exists
      const [existing] = await db
        .select()
        .from(vtTrainers)
        .where(
          and(
            eq(vtTrainers.firstName, first),
            eq(vtTrainers.lastName, lastName)
          )
        )
        .limit(1);

      if (existing) {
        trainerMap.set(normalizeName(trainerName), existing.id);
        // Update existing trainer with latest rates
        await db.update(vtTrainers)
          .set({
            sessionRate,
            nonSessionRate,
            lastRaiseDate,
            updatedAt: new Date(),
          })
          .where(eq(vtTrainers.id, existing.id));
        console.log(`   🔄 Updated: ${trainerName}`);
        continue;
      }

      const id = createId();
      await db.insert(vtTrainers).values({
        id,
        firstName: first,
        lastName: lastName,
        sessionRate,
        nonSessionRate,
        lastRaiseDate,
        isActive: true,
      });

      trainerMap.set(normalizeName(trainerName), id);
      console.log(`   ✓ Imported: ${trainerName}`);
    }

    console.log(`✅ Trainers processed: ${trainerMap.size}\n`);
  } catch (err) {
    console.error("⚠️  Could not import trainers:", err);
  }

  // Helper to get trainer ID by name
  const getTrainerId = (name: string | undefined): string | null => {
    const normalized = normalizeTrainerName(name);
    if (!normalized) return null;
    const key = normalizeName(normalized);
    return trainerMap.get(key) || null;
  };

  // =========================================================================
  // STEP 2: Import Members from Member Tracker
  // =========================================================================
  console.log("📥 Step 2: Importing Members from Member Tracker...");

  const memberMap = new Map<string, string>(); // name -> id

  try {
    // Use specialized parser for Member Tracker (has duplicate "Trainer" columns)
    const memberData = parseMemberTrackerCSV(CSV_FILES.memberTracker);

    let imported = 0;
    let updated = 0;

    for (const row of memberData) {
      const memberName = row.member;
      if (!memberName || memberName === "") continue;

      const trainerName = row.trainer;
      const priceStr = row.pricePerSession;
      const email = row.email;
      const daysSinceStr = row.daysSince;
      const lastVisitStr = row.lastVisit;
      const referredBy = row.referredBy || null;

      const [first, ...lastParts] = memberName.split(" ");
      const lastName = lastParts.join(" ") || "";

      const daysSince = daysSinceStr && daysSinceStr !== "" ? parseInt(daysSinceStr) : null;
      const memberStatus = getMemberStatus(daysSince);
      const lastVisitDate = parseDate(lastVisitStr);

      // Check if already exists
      const [existing] = await db
        .select()
        .from(vtMembers)
        .where(
          and(
            eq(vtMembers.firstName, first),
            eq(vtMembers.lastName, lastName)
          )
        )
        .limit(1);

      if (existing) {
        memberMap.set(normalizeName(memberName), existing.id);
        // Update existing member with latest data
        await db.update(vtMembers)
          .set({
            trainerId: getTrainerId(trainerName) || existing.trainerId,
            pricePerSession: priceToCents(priceStr) || existing.pricePerSession,
            email: (email && email !== "N/A") ? email : existing.email,
            status: memberStatus,
            daysSinceVisit: daysSince,
            lastVisitDate,
            referredBy: referredBy || existing.referredBy,
            updatedAt: new Date(),
          })
          .where(eq(vtMembers.id, existing.id));
        updated++;
        continue;
      }

      const id = createId();
      await db.insert(vtMembers).values({
        id,
        firstName: first,
        lastName: lastName,
        email: email && email !== "N/A" ? email : null,
        trainerId: getTrainerId(trainerName),
        pricePerSession: priceToCents(priceStr),
        status: memberStatus,
        daysSinceVisit: daysSince,
        lastVisitDate,
        referredBy,
      });

      memberMap.set(normalizeName(memberName), id);
      imported++;
    }

    console.log(`✅ Members imported: ${imported}, updated: ${updated}\n`);
  } catch (err) {
    console.error("⚠️  Could not import members:", err);
  }

  // Helper to get member ID by name
  const getMemberId = (name: string | undefined): string | null => {
    if (!name) return null;
    return memberMap.get(normalizeName(name)) || null;
  };

  // =========================================================================
  // STEP 3: Import Exercises from Movement Library
  // =========================================================================
  console.log("📥 Step 3: Importing Exercises from Movement Library...");

  const exerciseMap = new Map<string, string>(); // name -> id

  try {
    const exerciseData = parseCSV(CSV_FILES.movementLibrary);

    let imported = 0;
    let updated = 0;
    let currentSection = "";

    for (const row of exerciseData) {
      const moveName = row["Move Name"];
      if (!moveName || moveName === "") continue;

      // Check for section headers
      if (moveName === "SOFT TISSUE RELEASES" || moveName === "STRETCHES" || moveName === "MOVEMENTS") {
        currentSection = moveName;
        continue;
      }

      const videoUrl = row["Video Link"] || null;
      const cuesNotes = row["Cues/Notes (Needs to be finished)"] || null;

      // Parse cues into array
      const cues: string[] = [];
      if (cuesNotes) {
        // Split on periods or commas for multiple cues
        const parts = cuesNotes.split(/\.\s+|,\s+/).filter(s => s.trim().length > 0);
        cues.push(...parts);
      }

      const category = getExerciseCategory(moveName, currentSection);

      // Check if already exists
      const [existing] = await db
        .select()
        .from(vtExercises)
        .where(eq(vtExercises.name, moveName))
        .limit(1);

      if (existing) {
        exerciseMap.set(normalizeName(moveName), existing.id);
        // Update with video link and cues
        await db.update(vtExercises)
          .set({
            videoUrl: videoUrl || existing.videoUrl,
            cues: cues.length > 0 ? cues : existing.cues,
            category,
            updatedAt: new Date(),
          })
          .where(eq(vtExercises.id, existing.id));
        updated++;
        continue;
      }

      const id = createId();
      await db.insert(vtExercises).values({
        id,
        name: moveName,
        category,
        videoUrl,
        cues,
        isActive: true,
      });

      exerciseMap.set(normalizeName(moveName), id);
      imported++;
    }

    console.log(`✅ Exercises imported: ${imported}, updated: ${updated}\n`);
  } catch (err) {
    console.error("⚠️  Could not import exercises:", err);
  }

  // =========================================================================
  // STEP 4: Import Prescriptions
  // =========================================================================
  console.log("📥 Step 4: Importing Prescriptions...");

  try {
    const prescriptionData = parseCSV(CSV_FILES.mobilityPrescriptions);

    let imported = 0;
    let skipped = 0;

    for (const row of prescriptionData) {
      const memberName = row["Member Name"];
      if (!memberName) continue;

      const memberId = getMemberId(memberName);
      if (!memberId) {
        console.log(`   ⚠️  Member not found: ${memberName}`);
        skipped++;
        continue;
      }

      // Collect exercises for this prescription
      const exercises: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const exercise = row[`Move ${i}`];
        if (exercise && exercise.trim() !== "") {
          exercises.push(exercise.trim());
        }
      }

      if (exercises.length === 0) continue;

      // Create prescription
      const prescriptionId = createId();
      await db.insert(vtPrescriptions).values({
        id: prescriptionId,
        memberId,
        status: row["Status"] === "SENT" ? "sent" : "draft",
      });

      // Add exercises to prescription
      for (let i = 0; i < exercises.length; i++) {
        const exerciseId = exerciseMap.get(normalizeName(exercises[i]));
        if (exerciseId) {
          await db.insert(vtPrescriptionExercises).values({
            id: createId(),
            prescriptionId,
            exerciseId,
            orderIndex: i + 1,
          });
        }
      }

      imported++;
    }

    console.log(`✅ Prescriptions imported: ${imported}, skipped: ${skipped}\n`);
  } catch (err) {
    console.error("⚠️  Could not import prescriptions:", err);
  }

  // =========================================================================
  // STEP 5: Import Contracts from New Members 2025
  // =========================================================================
  console.log("📥 Step 5: Importing Contracts...");

  try {
    // Use specialized parser for the complex New Members CSV structure
    const contractData = parseNewMembersCSV(CSV_FILES.newMembers);
    console.log(`   📄 Found ${contractData.length} contract rows in New Members CSV`);
    if (contractData.length > 0) {
      console.log(`   📋 First contract: ${contractData[0].member} - ${contractData[0].programType}`);
    }

    let imported = 0;
    let skipped = 0;

    for (const row of contractData) {
      const memberName = row.member.trim();
      if (!memberName) continue;

      const programType = row.programType.trim();
      if (!programType) {
        console.log(`   ⏭️ Skipping ${memberName}: no program type`);
        skipped++;
        continue;
      }

      let memberId = getMemberId(memberName);
      if (!memberId) {
        // Create the member if they don't exist
        const [first, ...lastParts] = memberName.split(" ");
        const lastName = lastParts.join(" ") || "";

        const newMemberId = createId();
        await db.insert(vtMembers).values({
          id: newMemberId,
          firstName: first,
          lastName: lastName,
          pricePerSession: priceToCents(row.price),
          status: "active",
        });

        memberMap.set(normalizeName(memberName), newMemberId);
        memberId = newMemberId;
        console.log(`   ➕ Created member from contract: ${memberName}`);
      }

      const contractType = getContractType(programType);
      const pricePerSession = priceToCents(row.price);
      const weeklySessionsStr = row.weeklySessions?.trim();
      let weeklySessions = 1;
      if (weeklySessionsStr && weeklySessionsStr !== "N/A" && weeklySessionsStr !== "" && weeklySessionsStr !== "-") {
        const parsed = parseInt(weeklySessionsStr);
        if (!isNaN(parsed)) {
          weeklySessions = parsed;
        }
      }
      const startDate = parseDate(row.startDate);
      const endDate = parseDate(row.endDate);
      const totalValue = priceToCents(row.totalValue);
      const commissionRate = getCommissionRate(contractType);
      const commissionAmount = priceToCents(row.commissionTotal);
      const hasEnrollmentFee = row.enrollmentFee === "Yes" || row.enrollmentFee === "yes";
      const alertStatus = row.alertStatus === "Done" || row.alertStatus === "done" ? "done" : "initial";
      const initialTrainerId = getTrainerId(row.initialTrainer);
      const contractNotes = row.contractStatus || null;
      
      // Parse lengthWeeks safely
      let lengthWeeks: number | null = null;
      const lengthWeeksStr = row.lengthWeeks?.trim();
      if (lengthWeeksStr && lengthWeeksStr !== "N/A" && lengthWeeksStr !== "" && lengthWeeksStr !== "-") {
        const parsed = parseInt(lengthWeeksStr);
        if (!isNaN(parsed)) {
          lengthWeeks = parsed;
        }
      }

      if (!startDate || !pricePerSession) {
        console.log(`   ⏭️ Skipping ${memberName}: startDate=${startDate}, price=${pricePerSession}`);
        skipped++;
        continue;
      }

      const id = createId();
      await db.insert(vtContracts).values({
        id,
        memberId,
        initialTrainerId,
        contractType,
        lengthWeeks,
        pricePerSession,
        weeklySessions,
        startDate,
        endDate,
        totalValue,
        commissionRate,
        commissionAmount,
        hasEnrollmentFee,
        alertStatus,
        contractNotes,
        status: "active",
      });

      imported++;
    }

    console.log(`✅ Contracts imported: ${imported}, skipped: ${skipped}\n`);
  } catch (err) {
    console.error("⚠️  Could not import contracts:", err);
  }

  // =========================================================================
  // STEP 6: Import Tasks from Command Center
  // =========================================================================
  console.log("📥 Step 6: Importing Tasks from Command Center...");

  try {
    const taskData = parseCSV(CSV_FILES.commandCenter);

    let imported = 0;
    let skipped = 0;

    for (const row of taskData) {
      // The CSV has summary rows at the top, skip them
      const taskTitle = row["Tasks (new entries go at the bottom)"];
      if (!taskTitle || taskTitle === "" || taskTitle.includes("Active Tasks") || taskTitle.includes("Completed Tasks") || taskTitle.includes("Completion")) {
        continue;
      }

      const owner = row["Owner"];
      const priority = getTaskPriority(row["Priority"]);
      const dueDate = parseDate(row["Due Date"]);
      const status = getTaskStatus(row["Status"]);

      // Try to find trainer ID for owner
      const ownerId = getTrainerId(owner);

      const id = createId();
      await db.insert(vtTasks).values({
        id,
        title: taskTitle,
        ownerId,
        ownerName: owner || null,
        priority,
        dueDate,
        status,
        completedAt: status === "done" ? new Date() : null,
      });

      imported++;
    }

    console.log(`✅ Tasks imported: ${imported}\n`);
  } catch (err) {
    console.error("⚠️  Could not import tasks:", err);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📊 Import Summary");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`   Trainers:      ${trainerMap.size}`);
  console.log(`   Members:       ${memberMap.size}`);
  console.log(`   Exercises:     ${exerciseMap.size}`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n✅ Import complete!");
}

importData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
  });
