/**
 * Create Demo Users Script
 * 
 * Creates demo user accounts directly in the database.
 * Uses the same password hashing as Better Auth (scrypt).
 * 
 * Usage: npx tsx scripts/create-demo-users.ts
 */

import { db, users, accounts, vtTrainers, vtMembers, eq, createId } from "@vt/db";
import * as crypto from "crypto";

const DEMO_PASSWORD = "demo123";

// Better Auth uses scrypt for password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${derivedKey.toString("hex")}`;
}

interface DemoUser {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "trainer" | "member";
}

const DEMO_USERS: DemoUser[] = [
  { email: "admin@demo-trainers.com", name: "Demo Admin", role: "admin" },
  { email: "trainer@demo-trainers.com", name: "Demo Trainer", role: "trainer" },
  { email: "member@demo-trainers.com", name: "Demo Member", role: "member" },
];

async function createDemoUsers() {
  console.log("═".repeat(50));
  console.log("🔑 CREATE DEMO USERS");
  console.log("═".repeat(50));
  console.log(`\nPassword for all accounts: ${DEMO_PASSWORD}\n`);

  const hashedPassword = await hashPassword(DEMO_PASSWORD);
  console.log("Password hash generated\n");

  for (const demoUser of DEMO_USERS) {
    console.log(`\nProcessing: ${demoUser.email} (${demoUser.role})`);

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, demoUser.email)).limit(1);
    
    if (existingUser.length > 0) {
      console.log(`  User already exists, updating password and role...`);
      const userId = existingUser[0].id;
      
      // Update existing user
      await db.update(users)
        .set({
          name: demoUser.name,
          role: demoUser.role,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      // Check if credential account exists
      const existingAccount = await db.select().from(accounts)
        .where(eq(accounts.userId, userId))
        .limit(1);
      
      if (existingAccount.length > 0) {
        // Update existing account password
        await db.update(accounts)
          .set({
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, existingAccount[0].id));
        console.log(`  Updated password in accounts table`);
      } else {
        // Create new credential account
        await db.insert(accounts).values({
          id: createId(),
          userId,
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`  Created credential account`);
      }
      
      // Link trainer/member if needed
      if (demoUser.role === "trainer" && !existingUser[0].trainerId) {
        const trainer = await db.select().from(vtTrainers).where(eq(vtTrainers.email, "trainer@demo.test")).limit(1);
        if (trainer.length > 0) {
          await db.update(users).set({ trainerId: trainer[0].id }).where(eq(users.id, userId));
          console.log(`  Linked to trainer record`);
        }
      }
      
      if (demoUser.role === "member" && !existingUser[0].memberId) {
        const member = await db.select().from(vtMembers).where(eq(vtMembers.email, "member@demo.test")).limit(1);
        if (member.length > 0) {
          await db.update(users).set({ memberId: member[0].id }).where(eq(users.id, userId));
          console.log(`  Linked to member record`);
        }
      }
      
      console.log(`  ✅ Updated ${demoUser.email}`);
    } else {
      // Create new user
      const userId = createId();
      let trainerId: string | null = null;
      let memberId: string | null = null;

      // Find or create trainer/member records
      if (demoUser.role === "trainer") {
        const existingTrainer = await db.select().from(vtTrainers).where(eq(vtTrainers.email, "trainer@demo.test")).limit(1);
        if (existingTrainer.length > 0) {
          trainerId = existingTrainer[0].id;
          console.log(`  Found existing trainer record`);
        } else {
          trainerId = createId();
          await db.insert(vtTrainers).values({
            id: trainerId,
            firstName: "Demo",
            lastName: "Trainer",
            email: "trainer@demo.test",
            phone: "(555) 100-0001",
            sessionRate: 4000,
            nonSessionRate: 2000,
            isActive: true,
            bio: "Demo trainer account for testing purposes.",
          });
          console.log(`  Created trainer record`);
        }
      }

      if (demoUser.role === "member") {
        const existingMember = await db.select().from(vtMembers).where(eq(vtMembers.email, "member@demo.test")).limit(1);
        if (existingMember.length > 0) {
          memberId = existingMember[0].id;
          console.log(`  Found existing member record`);
        } else {
          // Link to the Demo Trainer
          const demoTrainer = await db.select().from(vtTrainers).where(eq(vtTrainers.email, "trainer@demo.test")).limit(1);
          
          memberId = createId();
          await db.insert(vtMembers).values({
            id: memberId,
            firstName: "Demo",
            lastName: "Member",
            email: "member@demo.test",
            phone: "(555) 200-0001",
            trainerId: demoTrainer.length > 0 ? demoTrainer[0].id : null,
            status: "active",
            pricePerSession: 7500,
          });
          console.log(`  Created member record`);
        }
      }

      await db.insert(users).values({
        id: userId,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        emailVerified: true,
        trainerId,
        memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create credential account for Better Auth
      await db.insert(accounts).values({
        id: createId(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  ✅ Created ${demoUser.email} with credential account`);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log("✅ DEMO USERS READY");
  console.log("═".repeat(50));
  console.log(`
┌──────────────────────────────────────────────────┐
│  DEMO LOGIN CREDENTIALS                          │
├──────────────────────────────────────────────────┤
│  Admin:   admin@demo-trainers.com   / demo123    │
│  Trainer: trainer@demo-trainers.com / demo123    │
│  Member:  member@demo-trainers.com  / demo123    │
└──────────────────────────────────────────────────┘
`);
}

createDemoUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
