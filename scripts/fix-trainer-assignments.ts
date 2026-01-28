/**
 * Fix trainer assignments for all members
 * Run with: pnpm tsx scripts/fix-trainer-assignments.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, sql } from "drizzle-orm";
import { readFileSync, existsSync } from "fs";
import { parse } from "csv-parse/sync";
import { join } from "path";
import * as schema from "../packages/db/src/schema";

const { vtTrainers, vtMembers } = schema;

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const DATA_DIR = join(process.cwd(), "data");
const MEMBER_TRACKER = join(DATA_DIR, "Vetted Trainers Data  - Member Tracker 2026.csv");

// Parse CSV file with explicit column handling
function parseCSVWithColumns(filePath: string): { member: string; trainer: string; price: string; email: string; daysSince: string; lastVisit: string }[] {
    if (!existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
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
    // 0: Last Visit, 1: Member, 2: Trainer, 3: Price per Session, 4: Email, 5: Days Since
    return rows.map((row: string[]) => ({
        lastVisit: row[0] || "",
        member: row[1] || "",
        trainer: row[2] || "",  // The FIRST Trainer column (index 2)
        price: row[3] || "",
        email: row[4] || "",
        daysSince: row[5] || "",
    }));
}

// Normalize name for matching
function normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function fixTrainerAssignments() {
    console.log("🔧 Fixing Trainer Assignments\n");

    // Step 1: Get all trainers from database
    console.log("📋 Loading trainers from database...");
    const trainers = await db.select().from(vtTrainers);

    const trainerMap = new Map<string, string>();
    for (const t of trainers) {
        const fullName = `${t.firstName} ${t.lastName}`;
        trainerMap.set(normalizeName(fullName), t.id);
        // Also add just first name as alias
        if (t.firstName) {
            trainerMap.set(normalizeName(t.firstName), t.id);
        }
    }

    console.log(`   Found ${trainers.length} trainers:`);
    for (const [key, id] of trainerMap.entries()) {
        const trainer = trainers.find(t => t.id === id);
        if (trainer) {
            console.log(`   - "${key}" -> ${trainer.firstName} ${trainer.lastName}`);
        }
    }

    // Add common aliases
    const aliases: Record<string, string> = {
        "mattalbano": "matthewalbano",
        "matt": "matthewalbano",
    };

    for (const [alias, target] of Object.entries(aliases)) {
        const targetId = trainerMap.get(target);
        if (targetId) {
            trainerMap.set(alias, targetId);
            console.log(`   Added alias: "${alias}" -> ${target}`);
        }
    }

    // Step 2: Load members from CSV
    console.log("\n📥 Loading members from CSV...");
    const memberData = parseCSVWithColumns(MEMBER_TRACKER);
    console.log(`   Found ${memberData.length} rows in CSV`);

    // Debug: show first few rows
    console.log("   First 3 rows:");
    for (const row of memberData.slice(0, 3)) {
        console.log(`   - ${row.member} -> Trainer: "${row.trainer}"`);
    }

    // Step 3: Get all members from database
    const dbMembers = await db.select().from(vtMembers);
    const memberLookup = new Map<string, typeof dbMembers[0]>();
    for (const m of dbMembers) {
        const key = normalizeName(`${m.firstName}${m.lastName}`);
        memberLookup.set(key, m);
    }
    console.log(`   Found ${dbMembers.length} members in database`);

    // Step 4: Update each member with trainer from CSV
    console.log("\n🔄 Updating member-trainer assignments...\n");

    let updated = 0;
    let skipped = 0;
    let noTrainer = 0;
    let notFound = 0;

    for (const row of memberData) {
        const memberName = row.member;
        const trainerName = row.trainer;

        if (!memberName) continue;

        // Find member in database
        const memberKey = normalizeName(memberName.replace(/\s+/g, ""));
        const member = memberLookup.get(memberKey);

        if (!member) {
            console.log(`   ⚠️  Member not in DB: ${memberName}`);
            notFound++;
            continue;
        }

        if (!trainerName || trainerName.trim() === "") {
            noTrainer++;
            continue;
        }

        // Find trainer ID
        const trainerKey = normalizeName(trainerName);
        const trainerId = trainerMap.get(trainerKey);

        if (!trainerId) {
            console.log(`   ⚠️  Trainer not found: "${trainerName}" (key: ${trainerKey}) for member ${memberName}`);
            skipped++;
            continue;
        }

        // Update if different
        if (member.trainerId !== trainerId) {
            await db.update(vtMembers)
                .set({ trainerId, updatedAt: new Date() })
                .where(eq(vtMembers.id, member.id));

            const trainer = trainers.find(t => t.id === trainerId);
            console.log(`   ✓ ${memberName} -> ${trainer?.firstName} ${trainer?.lastName}`);
            updated++;
        }
    }

    console.log("\n═══════════════════════════════════════════");
    console.log("📊 Summary");
    console.log("═══════════════════════════════════════════");
    console.log(`   Updated:      ${updated}`);
    console.log(`   No trainer:   ${noTrainer} (CSV has empty trainer)`);
    console.log(`   Skipped:      ${skipped} (trainer not found)`);
    console.log(`   Not in DB:    ${notFound}`);
    console.log("═══════════════════════════════════════════\n");

    // Verify
    const withTrainer = await db
        .select({ count: sql<number>`count(*)` })
        .from(vtMembers)
        .where(sql`${vtMembers.trainerId} IS NOT NULL`);

    console.log(`✅ Members with trainer assigned: ${withTrainer[0]?.count || 0}`);
}

fixTrainerAssignments()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Failed:", err);
        process.exit(1);
    });
