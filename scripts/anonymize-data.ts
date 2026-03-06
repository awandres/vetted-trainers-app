/**
 * Data Anonymization Script
 * 
 * Replaces all real client/trainer data with synthetic anonymous data.
 * Run this BEFORE deploying as a public demo site.
 * 
 * Usage: npx tsx scripts/anonymize-data.ts
 * 
 * WARNING: This will permanently replace all existing member/trainer data!
 */

import { 
  db, 
  vtMembers, 
  vtTrainers, 
  vtSessions,
  vtContracts,
  vtPrescriptions,
  vtPayrollPeriods,
  vtPayrollDetails,
  vtTrainerMetrics,
  vtTasks,
  vtEmailEvents,
  vtAutomatedEmailLogs,
  vtAutomatedEmails,
  users,
  eq,
  isNotNull,
} from "@vt/db";

// Synthetic first names
const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery", 
  "Jamie", "Drew", "Skyler", "Cameron", "Parker", "Hayden", "Dakota", "Reese",
  "Blake", "Sage", "Finley", "Rowan", "Charlie", "Emerson", "Phoenix", "River",
  "Spencer", "Bailey", "Kendall", "Logan", "Peyton", "Addison", "Harper", "Ellis"
];

// Synthetic last names
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee",
  "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Hall",
  "Young", "Allen", "King", "Wright", "Hill", "Scott", "Green", "Adams"
];

// Email domains for synthetic data
const EMAIL_DOMAINS = ["example.com", "demo.test", "sample.org", "test.net"];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSyntheticEmail(firstName: string, lastName: string, index: number): string {
  const domain = randomElement(EMAIL_DOMAINS);
  const variation = randomInt(1, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${variation}@${domain}`;
}

function generateSyntheticPhone(): string {
  return `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

async function anonymizeTrainers() {
  console.log("\n📋 Anonymizing trainers...");
  
  const trainers = await db.select().from(vtTrainers);
  console.log(`  Found ${trainers.length} trainers`);
  
  let updated = 0;
  for (let i = 0; i < trainers.length; i++) {
    const trainer = trainers[i];
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    
    await db.update(vtTrainers)
      .set({
        firstName,
        lastName,
        email: generateSyntheticEmail(firstName, lastName, i),
        phone: generateSyntheticPhone(),
        bio: `${firstName} is a certified personal trainer with expertise in strength training and nutrition coaching.`,
        updatedAt: new Date(),
      })
      .where(eq(vtTrainers.id, trainer.id));
    
    updated++;
  }
  
  console.log(`  ✅ Anonymized ${updated} trainers`);
}

async function anonymizeMembers() {
  console.log("\n👥 Anonymizing members...");
  
  const members = await db.select().from(vtMembers);
  console.log(`  Found ${members.length} members`);
  
  let updated = 0;
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    
    await db.update(vtMembers)
      .set({
        firstName,
        lastName,
        email: generateSyntheticEmail(firstName, lastName, i),
        phone: generateSyntheticPhone(),
        notes: null,
        referredBy: null,
        updatedAt: new Date(),
      })
      .where(eq(vtMembers.id, member.id));
    
    updated++;
  }
  
  console.log(`  ✅ Anonymized ${updated} members`);
}

async function randomizePayrollPeriods() {
  console.log("\n💰 Randomizing payroll period data...");
  
  const periods = await db.select().from(vtPayrollPeriods);
  console.log(`  Found ${periods.length} payroll period records`);
  
  let updated = 0;
  for (const record of periods) {
    const baseRevenue = randomInt(15000, 45000) * 100;
    const totalPayout = Math.floor(baseRevenue * 0.4);
    const fixedExpenses = randomInt(2000, 5000) * 100;
    
    await db.update(vtPayrollPeriods)
      .set({
        s2sRevenue: Math.floor(baseRevenue * 0.3),
        contractedRevenue: Math.floor(baseRevenue * 0.7),
        totalRevenue: baseRevenue,
        targetRevenue: randomInt(20000, 50000) * 100,
        totalPayout,
        fixedExpenses,
        totalExpenses: totalPayout + fixedExpenses,
        netProfit: baseRevenue - totalPayout - fixedExpenses,
        productSales: randomInt(100, 500) * 100,
        enrollmentFees: randomInt(0, 300) * 100,
        notes: null,
        updatedAt: new Date(),
      })
      .where(eq(vtPayrollPeriods.id, record.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} payroll period records`);
}

async function randomizePayrollDetails() {
  console.log("\n💵 Randomizing payroll detail data...");
  
  const payrollDetails = await db.select().from(vtPayrollDetails);
  console.log(`  Found ${payrollDetails.length} payroll detail records`);
  
  let updated = 0;
  for (const detail of payrollDetails) {
    const sessions = String(randomInt(15, 40));
    const sessionRate = randomInt(30, 50) * 100;
    const nonSessionHours = String(randomInt(0, 10));
    const nonSessionRate = randomInt(15, 25) * 100;
    
    const sessionPaySubtotal = Number(sessions) * sessionRate;
    const nonSessionPaySubtotal = Number(nonSessionHours) * nonSessionRate;
    
    await db.update(vtPayrollDetails)
      .set({
        totalSessions: sessions,
        sessionRate,
        sessionPaySubtotal,
        nonSessionHours,
        nonSessionRate,
        nonSessionPaySubtotal,
        s2sCommission: randomInt(0, 200) * 100,
        salesCommission: randomInt(0, 300) * 100,
        totalPay: sessionPaySubtotal + nonSessionPaySubtotal + randomInt(0, 500) * 100,
        notes: null,
      })
      .where(eq(vtPayrollDetails.id, detail.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} payroll detail records`);
}

async function randomizeSessions() {
  console.log("\n📅 Randomizing session values...");
  
  const sessions = await db.select().from(vtSessions);
  console.log(`  Found ${sessions.length} session records`);
  
  let updated = 0;
  for (const session of sessions) {
    await db.update(vtSessions)
      .set({
        priceCharged: randomInt(50, 100) * 100,
        notes: null,
      })
      .where(eq(vtSessions.id, session.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} session records`);
}

async function randomizeContracts() {
  console.log("\n📝 Randomizing contract values...");
  
  const contracts = await db.select().from(vtContracts);
  console.log(`  Found ${contracts.length} contract records`);
  
  let updated = 0;
  for (const contract of contracts) {
    const pricePerSession = randomInt(50, 100) * 100;
    const weeklySessions = randomInt(1, 3);
    const lengthWeeks = randomInt(12, 52);
    
    await db.update(vtContracts)
      .set({
        pricePerSession,
        weeklySessions,
        lengthWeeks,
        totalValue: pricePerSession * weeklySessions * lengthWeeks,
        notes: null,
      })
      .where(eq(vtContracts.id, contract.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} contract records`);
}

async function randomizePrescriptions() {
  console.log("\n💪 Randomizing prescription names...");
  
  const prescriptionNames = [
    "Strength Building Program",
    "Weight Loss Protocol",
    "Mobility & Flexibility",
    "Core Strength Focus",
    "Upper Body Development",
    "Lower Body Power",
    "Full Body Conditioning",
    "HIIT Training Plan",
    "Recovery & Stretching",
    "Athletic Performance",
  ];
  
  const prescriptions = await db.select().from(vtPrescriptions);
  console.log(`  Found ${prescriptions.length} prescription records`);
  
  let updated = 0;
  for (const prescription of prescriptions) {
    await db.update(vtPrescriptions)
      .set({
        name: randomElement(prescriptionNames),
        notes: "Focus on proper form and controlled movements.",
      })
      .where(eq(vtPrescriptions.id, prescription.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} prescription records`);
}

async function randomizeTrainerMetrics() {
  console.log("\n📊 Randomizing trainer metrics...");
  
  const metrics = await db.select().from(vtTrainerMetrics);
  console.log(`  Found ${metrics.length} trainer metric records`);
  
  let updated = 0;
  for (const metric of metrics) {
    await db.update(vtTrainerMetrics)
      .set({
        totalSessions: randomInt(20, 60),
        totalRevenue: randomInt(2000, 8000) * 100,
        averageSessionsPerClient: String(randomInt(15, 35) / 10),
        clientRetentionRate: String(randomInt(70, 95)),
      })
      .where(eq(vtTrainerMetrics.id, metric.id));
    
    updated++;
  }
  
  console.log(`  ✅ Randomized ${updated} trainer metric records`);
}

async function anonymizeTasks() {
  console.log("\n📋 Anonymizing task data...");
  
  const taskTitles = [
    "Follow up with client",
    "Review training plan",
    "Update equipment inventory",
    "Schedule team meeting",
    "Complete monthly report",
    "Client consultation call",
    "Marketing review",
    "System maintenance",
    "Performance review prep",
    "New client onboarding",
  ];
  
  const tasks = await db.select().from(vtTasks);
  console.log(`  Found ${tasks.length} task records`);
  
  let updated = 0;
  for (const task of tasks) {
    await db.update(vtTasks)
      .set({
        title: randomElement(taskTitles),
        description: "Task description placeholder.",
        ownerName: null,
        updatedAt: new Date(),
      })
      .where(eq(vtTasks.id, task.id));
    
    updated++;
  }
  
  console.log(`  ✅ Anonymized ${updated} tasks`);
}

async function anonymizeEmailData() {
  console.log("\n📧 Anonymizing email data...");
  
  const events = await db.select().from(vtEmailEvents);
  console.log(`  Found ${events.length} email event records`);
  
  let updated = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    await db.update(vtEmailEvents)
      .set({
        recipientEmail: `user${i + 1}@example.com`,
      })
      .where(eq(vtEmailEvents.id, event.id));
    updated++;
  }
  
  const logs = await db.select().from(vtAutomatedEmailLogs);
  console.log(`  Found ${logs.length} automated email log records`);
  
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    await db.update(vtAutomatedEmailLogs)
      .set({
        recipientEmail: `user${i + 1}@example.com`,
      })
      .where(eq(vtAutomatedEmailLogs.id, log.id));
    updated++;
  }
  
  const automatedEmails = await db.select().from(vtAutomatedEmails);
  console.log(`  Found ${automatedEmails.length} automated email templates`);
  
  for (const email of automatedEmails) {
    await db.update(vtAutomatedEmails)
      .set({
        testEmails: null,
      })
      .where(eq(vtAutomatedEmails.id, email.id));
    updated++;
  }
  
  console.log(`  ✅ Anonymized ${updated} email records`);
}

async function updateUserNames() {
  console.log("\n👤 Updating user account names...");
  
  const allUsers = await db.select().from(users).where(isNotNull(users.memberId));
  console.log(`  Found ${allUsers.length} member-linked users`);
  
  let updated = 0;
  for (const user of allUsers) {
    if (!user.memberId) continue;
    
    const member = await db.select().from(vtMembers).where(eq(vtMembers.id, user.memberId)).limit(1);
    if (member.length > 0) {
      await db.update(users)
        .set({
          name: `${member[0].firstName} ${member[0].lastName}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      updated++;
    }
  }
  
  const trainerUsers = await db.select().from(users).where(isNotNull(users.trainerId));
  console.log(`  Found ${trainerUsers.length} trainer-linked users`);
  
  for (const user of trainerUsers) {
    if (!user.trainerId) continue;
    
    const trainer = await db.select().from(vtTrainers).where(eq(vtTrainers.id, user.trainerId)).limit(1);
    if (trainer.length > 0) {
      await db.update(users)
        .set({
          name: `${trainer[0].firstName} ${trainer[0].lastName}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      updated++;
    }
  }
  
  console.log(`  ✅ Updated ${updated} user names`);
}

async function anonymizeData() {
  console.log("═".repeat(50));
  console.log("🔒 DATA ANONYMIZATION SCRIPT");
  console.log("═".repeat(50));
  console.log("\n⚠️  WARNING: This will replace all real data with synthetic data!");
  console.log("    This action cannot be undone.\n");

  try {
    await anonymizeTrainers();
    await anonymizeMembers();
    await randomizePayrollPeriods();
    await randomizePayrollDetails();
    await randomizeSessions();
    await randomizeContracts();
    await randomizePrescriptions();
    await randomizeTrainerMetrics();
    await anonymizeTasks();
    await anonymizeEmailData();
    await updateUserNames();

    console.log("\n" + "═".repeat(50));
    console.log("✅ DATA ANONYMIZATION COMPLETE");
    console.log("═".repeat(50));
    console.log("\nAll personal identifiable information has been replaced");
    console.log("with synthetic data. The database is now safe for public demos.\n");
    
  } catch (error) {
    console.error("\n❌ Error during anonymization:", error);
    throw error;
  }
}

anonymizeData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
