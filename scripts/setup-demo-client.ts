import { db, users, vtMembers, vtTrainers, vtSessions, vtPrescriptions, vtPrescriptionExercises, vtExercises, eq } from "@vt/db";

async function setupDemoClient() {
  console.log("🎯 Setting up demo client with full data...\n");

  // 1. Find or create a trainer
  let trainer = (await db.select().from(vtTrainers).limit(1))[0];
  
  if (!trainer) {
    console.log("Creating demo trainer...");
    [trainer] = await db.insert(vtTrainers).values({
      firstName: "Demo",
      lastName: "Trainer",
      email: "demo-trainer@vettedtrainers.com",
      phone: "555-0100",
      isActive: true,
    }).returning();
  }
  console.log(`✅ Trainer: ${trainer.firstName} ${trainer.lastName} (${trainer.id})`);

  // 2. Create or update demo member
  let member = (await db.select().from(vtMembers).where(eq(vtMembers.email, "demo-client@vettedtrainers.com")).limit(1))[0];
  
  if (!member) {
    console.log("Creating demo member...");
    [member] = await db.insert(vtMembers).values({
      firstName: "Demo",
      lastName: "Client",
      email: "demo-client@vettedtrainers.com",
      phone: "555-0123",
      trainerId: trainer.id,
      status: "active",
      lastVisitDate: new Date().toISOString().split('T')[0],
      daysSinceVisit: 0,
      notes: "Demo client for testing the member portal",
    }).returning();
  } else {
    // Update existing member to ensure it's linked to trainer
    [member] = await db.update(vtMembers).set({
      trainerId: trainer.id,
      status: "active",
      lastVisitDate: new Date().toISOString().split('T')[0],
      daysSinceVisit: 0,
    }).where(eq(vtMembers.id, member.id)).returning();
  }
  console.log(`✅ Member: ${member.firstName} ${member.lastName} (${member.id})`);

  // 3. Link user account to member
  const demoUser = (await db.select().from(users).where(eq(users.email, "demo-client@vettedtrainers.com")).limit(1))[0];
  
  if (demoUser) {
    await db.update(users).set({
      memberId: member.id,
      role: "member",
    }).where(eq(users.id, demoUser.id));
    console.log(`✅ User account linked to member`);
  } else {
    console.log("⚠️  No user account found - please run seed-demo-client.ts first");
  }

  // 4. Create demo sessions
  const today = new Date();
  const sessions = [
    { daysAgo: 0, type: "in_gym" as const },
    { daysAgo: 3, type: "in_gym" as const },
    { daysAgo: 7, type: "in_gym" as const },
    { daysAgo: 10, type: "strength_assessment" as const },
    { daysAgo: 14, type: "in_gym" as const },
    { daysAgo: 21, type: "in_gym" as const },
  ];

  console.log("Creating demo sessions...");
  for (const session of sessions) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() - session.daysAgo);
    
    try {
      await db.insert(vtSessions).values({
        memberId: member.id,
        trainerId: trainer.id,
        sessionDate: sessionDate.toISOString().split('T')[0],
        sessionType: session.type,
        notes: session.daysAgo === 0 ? "Today's session - great progress!" : undefined,
      });
    } catch (e) {
      // Session might already exist
    }
  }
  console.log(`✅ Created ${sessions.length} demo sessions`);

  // 5. Check for exercises and create prescription
  const exercises = await db.select().from(vtExercises).limit(5);
  
  if (exercises.length > 0) {
    console.log("Creating demo prescription...");
    const [prescription] = await db.insert(vtPrescriptions).values({
      memberId: member.id,
      prescribedByTrainerId: trainer.id,
      name: "Mobility & Strength Program",
      status: "sent",
      sentAt: new Date(),
      notes: "Focus on hip mobility and core strength",
    }).returning();

    // Add exercises to prescription
    for (let i = 0; i < Math.min(exercises.length, 4); i++) {
      try {
        await db.insert(vtPrescriptionExercises).values({
          prescriptionId: prescription.id,
          exerciseId: exercises[i].id,
          sets: 3,
          reps: "10-12",
          notes: i === 0 ? "Focus on form" : undefined,
          orderIndex: i,
        });
      } catch (e) {
        // Might already exist
      }
    }
    console.log(`✅ Created prescription with ${Math.min(exercises.length, 4)} exercises`);
  } else {
    console.log("⚠️  No exercises in database - skipping prescription");
  }

  console.log("\n🎉 Demo client setup complete!");
  console.log("──────────────────────────────────────────────────");
  console.log(`   📧 Email: demo-client@vettedtrainers.com`);
  console.log(`   🔑 Password: client123!`);
  console.log(`   👤 Member: ${member.firstName} ${member.lastName}`);
  console.log(`   🏋️ Trainer: ${trainer.firstName} ${trainer.lastName}`);
  console.log(`   📅 Sessions: ${sessions.length}`);
  console.log(`   🌐 Portal: http://localhost:3002`);
  console.log("──────────────────────────────────────────────────");
}

setupDemoClient()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
