import { NextRequest, NextResponse } from "next/server";
import { db, vtPayrollPeriods, vtPayrollDetails, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [period] = await db
      .select()
      .from(vtPayrollPeriods)
      .where(eq(vtPayrollPeriods.id, id));

    if (!period) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 });
    }

    // Also fetch any existing payroll details for this period
    const details = await db
      .select()
      .from(vtPayrollDetails)
      .where(eq(vtPayrollDetails.payrollPeriodId, id));

    return NextResponse.json({ period, details });
  } catch (error) {
    console.error("Error fetching payroll period:", error);
    return NextResponse.json({ error: "Failed to fetch payroll period" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedPeriod] = await db
      .update(vtPayrollPeriods)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(vtPayrollPeriods.id, id))
      .returning();

    if (!updatedPeriod) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 });
    }

    return NextResponse.json({ period: updatedPeriod });
  } catch (error) {
    console.error("Error updating payroll period:", error);
    return NextResponse.json({ error: "Failed to update payroll period" }, { status: 500 });
  }
}
