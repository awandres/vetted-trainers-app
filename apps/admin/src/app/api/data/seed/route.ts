import { NextResponse } from "next/server";
import { db, vtMembers, vtTrainers, vtSessions, vtContracts, createId } from "@vt/db";

// Sample data generators
const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Jamie", "Drew"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Anderson"];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "example.com"];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(domains)}`;
}

function generatePhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

export async function POST() {
  try {
    const results = {
      trainers: 0,
      members: 0,
      sessions: 0,
      contracts: 0,
    };

    // Create sample trainers
    const trainerIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const trainerId = createId();
      
      await db.insert(vtTrainers).values({
        id: trainerId,
        firstName,
        lastName,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        sessionRate: randomInt(25, 50) * 100, // $25-50
        nonSessionRate: randomInt(15, 25) * 100, // $15-25
        isActive: true,
      }).onConflictDoNothing();
      
      trainerIds.push(trainerId);
      results.trainers++;
    }

    // Create sample members
    const memberIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const memberId = createId();
      const trainerId = randomElement(trainerIds);
      
      const statuses = ["active", "active", "active", "inactive", "churned"] as const;
      const status = randomElement(statuses);
      
      // Calculate days since visit based on status
      let daysSinceVisit = 0;
      if (status === "active") daysSinceVisit = randomInt(0, 10);
      else if (status === "inactive") daysSinceVisit = randomInt(14, 45);
      else if (status === "churned") daysSinceVisit = randomInt(46, 120);

      const lastVisit = new Date();
      lastVisit.setDate(lastVisit.getDate() - daysSinceVisit);
      
      await db.insert(vtMembers).values({
        id: memberId,
        firstName,
        lastName,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        pricePerSession: randomInt(50, 100) * 100, // $50-100
        assignedTrainerId: trainerId,
        status,
        daysSinceVisit,
        lastVisitDate: lastVisit.toISOString().split("T")[0],
        emailOptOut: false,
      }).onConflictDoNothing();
      
      memberIds.push(memberId);
      results.members++;
    }

    // Create sample sessions
    for (let i = 0; i < 20; i++) {
      const memberId = randomElement(memberIds);
      const trainerId = randomElement(trainerIds);
      
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - randomInt(0, 30));
      
      await db.insert(vtSessions).values({
        id: createId(),
        memberId,
        trainerId,
        sessionDate: sessionDate.toISOString().split("T")[0],
        sessionValue: "1.00",
        priceCharged: randomInt(50, 100) * 100,
        sessionType: randomElement(["personal_training", "stretch", "group"]),
        paymentStatus: randomElement(["paid", "paid", "pending"]),
      }).onConflictDoNothing();
      
      results.sessions++;
    }

    // Create sample contracts
    for (let i = 0; i < 5; i++) {
      const memberId = randomElement(memberIds);
      const trainerId = randomElement(trainerIds);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - randomInt(30, 180));
      
      const lengthWeeks = randomInt(12, 52);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + lengthWeeks * 7);
      
      const pricePerSession = randomInt(50, 100) * 100;
      const weeklySessions = randomInt(1, 3);
      const totalValue = pricePerSession * weeklySessions * lengthWeeks;
      
      await db.insert(vtContracts).values({
        id: createId(),
        memberId,
        soldByTrainerId: trainerId,
        contractType: randomElement(["training_agreement", "price_lock", "session_to_session"]),
        pricePerSession,
        weeklySessions,
        lengthWeeks,
        totalValue,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status: endDate > new Date() ? "active" : "completed",
        hasEnrollmentFee: Math.random() > 0.5,
      }).onConflictDoNothing();
      
      results.contracts++;
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.trainers} trainers, ${results.members} members, ${results.sessions} sessions, and ${results.contracts} contracts`,
      results,
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
