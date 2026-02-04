/**
 * Seed script to create a demo trainer login
 * Run with: npx tsx scripts/seed-demo-trainer.ts
 */

import { db, users, vtTrainers, accounts, eq } from "@vt/db";
import crypto from "crypto";

// Simple password hashing using Node.js crypto (compatible with better-auth scrypt)
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function seedDemoTrainer() {
  console.log("🏋️ Creating demo trainer account...\n");

  const email = "demo-trainer@vettedtrainers.com";
  const password = "demo123!";
  const trainerId = "EPN7e6oljG2DbYFHlNc7z2sG31hipNNJ"; // Joey Bomango

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("⚠️  Demo trainer account already exists!");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    process.exit(0);
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Create the user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name: "DEMO - Joey Bomango",
      passwordHash,
      role: "trainer",
      trainerId,
      emailVerified: true,
    })
    .returning();

  console.log("✅ Demo trainer user created:");
  console.log(`   ID: ${newUser.id}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Trainer ID: ${trainerId}`);

  // Create the credential account entry for Better Auth
  await db
    .insert(accounts)
    .values({
      userId: newUser.id,
      accountId: newUser.id,
      providerId: "credential",
      password: passwordHash,
    });

  console.log("✅ Credential account created");

  // Update the trainer record to link back to the user
  await db
    .update(vtTrainers)
    .set({
      userId: newUser.id,
      email: email,
    })
    .where(eq(vtTrainers.id, trainerId));

  console.log("✅ Trainer record linked to user");
  console.log("\n🎉 Done! You can now log in with:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

seedDemoTrainer()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding demo trainer:", err);
    process.exit(1);
  });
