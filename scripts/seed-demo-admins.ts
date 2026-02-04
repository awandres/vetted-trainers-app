/**
 * Seed script to create demo admin accounts
 * 
 * NOTE: This script requires the server to be running at localhost:3000
 * It creates accounts through Better Auth's signup API to ensure proper password hashing.
 * 
 * Run with: npx tsx scripts/seed-demo-admins.ts
 */

import { db, users, eq } from "@vt/db";

interface DemoAccount {
  email: string;
  name: string;
  password: string;
  role: "admin" | "trainer" | "member";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "demo-admin@vettedtrainers.com",
    name: "DEMO - Admin User",
    password: "demo123!",
    role: "admin",
  },
  {
    email: "alex.r.wandres@gmail.com",
    name: "Alex Wandres",
    password: "admin123!",
    role: "admin",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function createAccountViaAPI(account: DemoAccount) {
  const { email, name, password, role } = account;

  // Check if user already exists in database
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    // User exists - just update to correct role
    await db.update(users).set({ role, emailVerified: true }).where(eq(users.email, email));
    console.log(`⚠️  Account ${email} already exists - updated role to ${role}`);
    return existingUser[0];
  }

  // Create account through Better Auth API for proper password hashing
  const response = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      console.log(`⚠️  Account ${email} already exists`);
      return null;
    }
    throw new Error(`Failed to create account: ${error.message}`);
  }

  console.log(`✅ Created account: ${email}`);

  // Update role to admin (signup defaults to member)
  await db.update(users).set({ role, emailVerified: true }).where(eq(users.email, email));
  console.log(`   → Updated role to: ${role}`);

  return await response.json();
}

async function seedDemoAdmins() {
  console.log("🛡️  Creating demo admin accounts...\n");
  console.log(`📡 Using API at: ${API_BASE}\n`);

  for (const account of DEMO_ACCOUNTS) {
    try {
      await createAccountViaAPI(account);
    } catch (err: any) {
      console.error(`❌ Error creating ${account.email}:`, err.message);
    }
  }

  console.log("\n🎉 Done! Demo admin accounts:");
  console.log("─".repeat(50));
  for (const account of DEMO_ACCOUNTS) {
    console.log(`   📧 Email: ${account.email}`);
    console.log(`   🔑 Password: ${account.password}`);
    console.log(`   👤 Role: ${account.role}`);
    console.log("");
  }
}

seedDemoAdmins()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding demo admins:", err);
    process.exit(1);
  });
