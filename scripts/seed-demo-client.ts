import { db, users, vtMembers, vtTrainers, eq } from "@vt/db";

async function seedDemoClient() {
  console.log("🧑 Creating demo client account...\n");

  // First, find a member to link to (or create one)
  const existingMembers = await db.select().from(vtMembers).limit(5);
  console.log(`Found ${existingMembers.length} existing members`);

  let memberId: string;
  let memberName: string;
  let memberEmail: string;

  if (existingMembers.length > 0) {
    // Use the first member
    const member = existingMembers[0];
    memberId = member.id;
    memberName = `${member.firstName} ${member.lastName}`;
    memberEmail = member.email || "demo-client@vettedtrainers.com";
    console.log(`Using existing member: ${memberName} (${memberId})`);
  } else {
    // Create a demo member
    console.log("No members found, creating a demo member...");
    
    // Find a trainer to assign
    const trainers = await db.select().from(vtTrainers).limit(1);
    const trainerId = trainers.length > 0 ? trainers[0].id : null;

    const [newMember] = await db.insert(vtMembers).values({
      firstName: "Demo",
      lastName: "Client",
      email: "demo-client@vettedtrainers.com",
      phone: "555-0123",
      trainerId: trainerId,
      membershipStatus: "active",
      startDate: new Date().toISOString().split('T')[0],
    }).returning();

    memberId = newMember.id;
    memberName = `${newMember.firstName} ${newMember.lastName}`;
    memberEmail = "demo-client@vettedtrainers.com";
    console.log(`Created new member: ${memberName} (${memberId})`);
  }

  const clientEmail = "demo-client@vettedtrainers.com";

  // Check if demo client account already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, clientEmail))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("Demo client account already exists, deleting it first...");
    await db.delete(users).where(eq(users.id, existingUser[0].id));
  }

  // Create the user account using Better Auth's signup with Origin header
  const signupUrl = "http://localhost:3000/api/auth/sign-up/email";
  
  const signupRes = await fetch(signupUrl, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify({
      email: clientEmail,
      password: "client123!",
      name: memberName,
    }),
  });

  if (!signupRes.ok) {
    const errorText = await signupRes.text();
    console.error("Signup failed:", errorText);
    throw new Error("Failed to create account via Better Auth");
  }

  const userData = await signupRes.json();
  console.log("User created via Better Auth:", userData.user?.id);

  // Update the user's role and link to member
  const [updatedUser] = await db
    .update(users)
    .set({
      role: "member",
      memberId: memberId,
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.email, clientEmail))
    .returning();

  console.log("\n✅ Demo client account created!");
  console.log("──────────────────────────────────────────────────");
  console.log(`   📧 Email: ${clientEmail}`);
  console.log(`   🔑 Password: client123!`);
  console.log(`   👤 Role: member`);
  console.log(`   🔗 Linked to: ${memberName}`);
  console.log(`   🌐 Portal: http://localhost:3002`);
  console.log("──────────────────────────────────────────────────");
}

seedDemoClient()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
