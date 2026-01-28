import { NextRequest, NextResponse } from "next/server";
import { db, vtPayrollPeriods, desc, and, gte, lte, sql } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    // Build where conditions
    const conditions = [];
    
    if (year) {
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      conditions.push(gte(vtPayrollPeriods.weekEnding, startOfYear));
      conditions.push(lte(vtPayrollPeriods.weekEnding, endOfYear));
    }

    const periods = conditions.length > 0
      ? await db.select().from(vtPayrollPeriods).where(and(...conditions)).orderBy(desc(vtPayrollPeriods.weekEnding))
      : await db.select().from(vtPayrollPeriods).orderBy(desc(vtPayrollPeriods.weekEnding));

    // Get available years
    const yearsResult = await db
      .select({
        year: sql<string>`DISTINCT EXTRACT(YEAR FROM ${vtPayrollPeriods.weekEnding})::text`,
      })
      .from(vtPayrollPeriods);

    const availableYears = yearsResult
      .map(r => r.year)
      .filter(Boolean)
      .sort((a, b) => parseInt(b) - parseInt(a));

    return NextResponse.json({ periods, availableYears });
  } catch (error) {
    console.error("Error fetching payroll periods:", error);
    return NextResponse.json({ error: "Failed to fetch payroll periods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { weekEnding } = await request.json();

    if (!weekEnding) {
      return NextResponse.json({ error: "weekEnding is required" }, { status: 400 });
    }

    const [newPeriod] = await db
      .insert(vtPayrollPeriods)
      .values({
        weekEnding,
        status: "draft",
      })
      .returning();

    return NextResponse.json({ period: newPeriod }, { status: 201 });
  } catch (error) {
    console.error("Error creating payroll period:", error);
    return NextResponse.json({ error: "Failed to create payroll period" }, { status: 500 });
  }
}
