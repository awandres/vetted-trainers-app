/**
 * Seed Demo Accounts Script
 * 
 * Creates standardized demo accounts for public demos:
 * - admin@demo-trainers.com (Admin role)
 * - trainer@demo-trainers.com (Trainer role, linked to trainer record)
 * - member@demo-trainers.com (Member role, linked to member record with data)
 * 
 * All accounts use password: demo123
 * 
 * Usage: npx tsx scripts/seed-demo-accounts.ts
 */

import { 
  db, 
  users, 
  vtMembers, 
  vtTrainers, 
  vtSessions, 
  vtContracts,
  vtPrescriptions,
  vtPrescriptionExercises,
  vtExercises,
  eq,
  createId 
} from "@vt/db";

const DEMO_PASSWORD = "demo123";
const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

interface DemoAccount {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "trainer" | "member";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "admin@demo-trainers.com", name: "Demo Admin", role: "admin" },
  { email: "trainer@demo-trainers.com", name: "Demo Trainer", role: "trainer" },
  { email: "member@demo-trainers.com", name: "Demo Member", role: "member" },
];

async function createUserViaBetterAuth(email: string, password: string, name: string): Promise<string | null> {
  const signupUrl = `${BASE_URL}/api/auth/sign-up/email`;
  
  try {
    const res = await fetch(signupUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Origin": BASE_URL,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`  Failed to create ${email}:`, errorText);
      return null;
    }

    const data = await res.json();
    return data.user?.id || null;
  } catch (error) {
    console.error(`  Error creating ${email}:`, error);
    return null;
  }
}

async function createDemoTrainer(): Promise<string> {
  const existingTrainer = await db
    .select()
    .from(vtTrainers)
    .where(eq(vtTrainers.email, "trainer@demo-trainers.com"))
    .limit(1);

  if (existingTrainer.length > 0) {
    console.log("  Using existing demo trainer record");
    return existingTrainer[0].id;
  }

  const trainerId = createId();
  await db.insert(vtTrainers).values({
    id: trainerId,
    firstName: "Demo",
    lastName: "Trainer",
    email: "trainer@demo-trainers.com",
    phone: "(555) 100-0001",
    sessionRate: 4000,
    nonSessionRate: 2000,
    isActive: true,
  });

  console.log("  Created demo trainer record");
  return trainerId;
}

async function createDemoMember(trainerId: string): Promise<string> {
  const existingMember = await db
    .select()
    .from(vtMembers)
    .where(eq(vtMembers.email, "member@demo-trainers.com"))
    .limit(1);

  if (existingMember.length > 0) {
    console.log("  Using existing demo member record");
    return existingMember[0].id;
  }

  const memberId = createId();
  const today = new Date();
  const lastVisit = new Date(today);
  lastVisit.setDate(lastVisit.getDate() - 3);

  await db.insert(vtMembers).values({
    id: memberId,
    firstName: "Demo",
    lastName: "Member",
    email: "member@demo-trainers.com",
    phone: "(555) 200-0002",
    pricePerSession: 7500,
    assignedTrainerId: trainerId,
    status: "active",
    daysSinceVisit: 3,
    lastVisitDate: lastVisit.toISOString().split("T")[0],
    emailOptOut: false,
  });

  console.log("  Created demo member record");
  return memberId;
}

async function createDemoSessions(memberId: string, trainerId: string): Promise<void> {
  const existingSessions = await db
    .select()
    .from(vtSessions)
    .where(eq(vtSessions.memberId, memberId))
    .limit(1);

  if (existingSessions.length > 0) {
    console.log("  Demo member already has sessions");
    return;
  }

  const today = new Date();
  const sessions = [];

  for (let i = 0; i < 12; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() - (i * 3 + Math.floor(Math.random() * 2)));
    
    sessions.push({
      id: createId(),
      memberId,
      trainerId,
      sessionDate: sessionDate.toISOString().split("T")[0],
      sessionValue: "1.00",
      priceCharged: 7500,
      sessionType: i % 3 === 0 ? "stretch" : "personal_training",
      paymentStatus: "paid" as const,
    });
  }

  await db.insert(vtSessions).values(sessions);
  console.log(`  Created ${sessions.length} demo sessions`);
}

async function createDemoContract(memberId: string, trainerId: string): Promise<void> {
  const existingContract = await db
    .select()
    .from(vtContracts)
    .where(eq(vtContracts.memberId, memberId))
    .limit(1);

  if (existingContract.length > 0) {
    console.log("  Demo member already has a contract");
    return;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 24 * 7);

  await db.insert(vtContracts).values({
    id: createId(),
    memberId,
    soldByTrainerId: trainerId,
    contractType: "training_agreement",
    pricePerSession: 7500,
    weeklySessions: 2,
    lengthWeeks: 24,
    totalValue: 7500 * 2 * 24,
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    status: "active",
    hasEnrollmentFee: false,
  });

  console.log("  Created demo contract");
}

async function createDemoPrescription(memberId: string, trainerId: string): Promise<void> {
  const existingPrescription = await db
    .select()
    .from(vtPrescriptions)
    .where(eq(vtPrescriptions.memberId, memberId))
    .limit(1);

  if (existingPrescription.length > 0) {
    console.log("  Demo member already has prescriptions");
    return;
  }

  const exercises = await db.select().from(vtExercises).limit(5);
  
  if (exercises.length === 0) {
    console.log("  No exercises in database, skipping prescription creation");
    return;
  }

  const prescriptionId = createId();
  const sentAt = new Date();
  sentAt.setDate(sentAt.getDate() - 7);

  await db.insert(vtPrescriptions).values({
    id: prescriptionId,
    memberId,
    trainerId,
    name: "Strength & Mobility Program",
    status: "sent",
    sentAt: sentAt,
    notes: "Focus on form and controlled movements. Rest 60-90 seconds between sets.",
  });

  const prescriptionExercises = exercises.map((exercise, index) => ({
    id: createId(),
    prescriptionId,
    exerciseId: exercise.id,
    orderIndex: index,
    sets: 3,
    reps: index % 2 === 0 ? 12 : 10,
    duration: exercise.category === "stretch" ? 30 : null,
    notes: index === 0 ? "Warm up with lighter weight first" : null,
  }));

  await db.insert(vtPrescriptionExercises).values(prescriptionExercises);
  console.log(`  Created demo prescription with ${prescriptionExercises.length} exercises`);
}

async function seedDemoAccounts() {
  console.log("=== Seeding Demo Accounts ===\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Password for all accounts: ${DEMO_PASSWORD}\n`);

  let trainerId: string | null = null;
  let memberId: string | null = null;

  for (const account of DEMO_ACCOUNTS) {
    console.log(`\nProcessing: ${account.email} (${account.role})`);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("  User already exists, updating...");
      
      if (account.role === "trainer" && !trainerId) {
        trainerId = await createDemoTrainer();
      }
      if (account.role === "member") {
        if (!trainerId) trainerId = await createDemoTrainer();
        memberId = await createDemoMember(trainerId);
      }

      await db
        .update(users)
        .set({
          role: account.role,
          trainerId: account.role === "trainer" ? trainerId : null,
          memberId: account.role === "member" ? memberId : null,
          emailVerified: true,
          accessDisabled: false,
          accessExpiresAt: null,
          accessDurationMinutes: null,
          updatedAt: new Date(),
        })
        .where(eq(users.email, account.email));

      console.log("  Updated existing user");
      continue;
    }

    if (account.role === "trainer") {
      trainerId = await createDemoTrainer();
    }

    if (account.role === "member") {
      if (!trainerId) trainerId = await createDemoTrainer();
      memberId = await createDemoMember(trainerId);
      await createDemoSessions(memberId, trainerId);
      await createDemoContract(memberId, trainerId);
      await createDemoPrescription(memberId, trainerId);
    }

    const userId = await createUserViaBetterAuth(account.email, DEMO_PASSWORD, account.name);

    if (!userId) {
      console.log("  Failed to create user via Better Auth");
      continue;
    }

    await db
      .update(users)
      .set({
        role: account.role,
        trainerId: account.role === "trainer" ? trainerId : null,
        memberId: account.role === "member" ? memberId : null,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.email, account.email));

    console.log(`  Created: ${account.name}`);
  }

  console.log("\n" + "═".repeat(50));
  console.log("Demo Accounts Ready!");
  console.log("═".repeat(50));
  console.log("\n┌──────────────────────────────────────────────────┐");
  console.log("│  DEMO LOGIN CREDENTIALS                          │");
  console.log("├──────────────────────────────────────────────────┤");
  console.log("│  Admin:   admin@demo-trainers.com   / demo123    │");
  console.log("│  Trainer: trainer@demo-trainers.com / demo123    │");
  console.log("│  Member:  member@demo-trainers.com  / demo123    │");
  console.log("└──────────────────────────────────────────────────┘");
  console.log("\nLogin at: " + BASE_URL + "/login\n");
}

seedDemoAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
