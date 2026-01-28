import { NextRequest, NextResponse } from "next/server";
import { db, vtTrainers } from "@vt/db";

export async function GET() {
  try {
    const trainers = await db
      .select()
      .from(vtTrainers)
      .orderBy(vtTrainers.firstName);

    return NextResponse.json({ trainers });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      sessionRate,
      nonSessionRate,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    const [newTrainer] = await db
      .insert(vtTrainers)
      .values({
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        sessionRate: sessionRate ? sessionRate * 100 : 3000,
        nonSessionRate: nonSessionRate ? nonSessionRate * 100 : 3000,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ trainer: newTrainer }, { status: 201 });
  } catch (error) {
    console.error("Error creating trainer:", error);
    return NextResponse.json(
      { error: "Failed to create trainer" },
      { status: 500 }
    );
  }
}
