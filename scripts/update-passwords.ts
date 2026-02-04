/**
 * Update Passwords Script
 * 
 * Updates passwords for all user accounts
 */

import { db, users, accounts, sessions, eq } from "@vt/db";
import { auth } from "@vt/auth/server";

// Password assignments
const passwordMap: Record<string, string> = {
  "alex.r.wandres@gmail.com": "tester1234@",
  "joel@vettedtrainers.com": "tester123",      // Keep same
  "joey@vettedtrainers.com": "joey444!",       // Team member
  "demo-client@vettedtrainers.com": "client100!", // Client
};

const defaultPassword = "bobdylan123";

async function updatePasswords() {
  console.log("=== Updating User Passwords ===\n");

  // Get all users
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
  }).from(users);

  console.log(`Found ${allUsers.length} users\n`);

  for (const user of allUsers) {
    if (!user.email) continue;

    const newPassword = passwordMap[user.email] || defaultPassword;
    
    console.log(`Updating: ${user.email} (${user.role})`);
    
    try {
      // Delete existing sessions and account
      await db.delete(sessions).where(eq(sessions.userId, user.id));
      await db.delete(accounts).where(eq(accounts.userId, user.id));
      
      // Store user data
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      
      // Delete user
      await db.delete(users).where(eq(users.id, user.id));
      
      // Recreate via Better Auth with new password
      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: newPassword,
          name: userData.name || userData.email.split("@")[0],
        },
      });
      
      if (result.user) {
        // Restore the role and other fields
        await db.update(users)
          .set({ role: userData.role })
          .where(eq(users.email, userData.email));
        
        console.log(`  ✅ Password updated successfully`);
      } else {
        console.log(`  ❌ Failed to recreate user`);
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log("\n=== Password Update Complete ===");
  console.log("\nPassword Summary:");
  console.log("  alex.r.wandres@gmail.com: tester1234@");
  console.log("  joel@vettedtrainers.com: tester123");
  console.log("  joey@vettedtrainers.com: joey444!");
  console.log("  demo-client@vettedtrainers.com: client100!");
  console.log("  All others: bobdylan123");
}

updatePasswords()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
