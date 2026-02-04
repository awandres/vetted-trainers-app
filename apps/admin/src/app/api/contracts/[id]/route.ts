import { NextRequest, NextResponse } from "next/server";
import { db, vtContracts, vtMembers, vtTrainers, eq } from "@vt/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [contractRow] = await db
      .select({
        id: vtContracts.id,
        contractType: vtContracts.contractType,
        pricePerSession: vtContracts.pricePerSession,
        weeklySessions: vtContracts.weeklySessions,
        lengthWeeks: vtContracts.lengthWeeks,
        totalValue: vtContracts.totalValue,
        startDate: vtContracts.startDate,
        endDate: vtContracts.endDate,
        status: vtContracts.status,
        commissionRate: vtContracts.commissionRate,
        commissionAmount: vtContracts.commissionAmount,
        hasEnrollmentFee: vtContracts.hasEnrollmentFee,
        enrollmentFeeAmount: vtContracts.enrollmentFeeAmount,
        alertStatus: vtContracts.alertStatus,
        contractNotes: vtContracts.contractNotes,
        createdAt: vtContracts.createdAt,
        updatedAt: vtContracts.updatedAt,
        memberId: vtContracts.memberId,
        initialTrainerId: vtContracts.initialTrainerId,
        memberFirstName: vtMembers.firstName,
        memberLastName: vtMembers.lastName,
        memberEmail: vtMembers.email,
        memberPhone: vtMembers.phone,
        memberStatus: vtMembers.status,
        trainerFirstName: vtTrainers.firstName,
        trainerLastName: vtTrainers.lastName,
      })
      .from(vtContracts)
      .leftJoin(vtMembers, eq(vtContracts.memberId, vtMembers.id))
      .leftJoin(vtTrainers, eq(vtContracts.initialTrainerId, vtTrainers.id))
      .where(eq(vtContracts.id, id));

    if (!contractRow) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Format response
    const contract = {
      id: contractRow.id,
      contractType: contractRow.contractType,
      pricePerSession: contractRow.pricePerSession,
      weeklySessions: contractRow.weeklySessions,
      lengthWeeks: contractRow.lengthWeeks,
      totalValue: contractRow.totalValue,
      startDate: contractRow.startDate,
      endDate: contractRow.endDate,
      status: contractRow.status,
      commissionRate: contractRow.commissionRate,
      commissionAmount: contractRow.commissionAmount,
      hasEnrollmentFee: contractRow.hasEnrollmentFee,
      enrollmentFeeAmount: contractRow.enrollmentFeeAmount,
      alertStatus: contractRow.alertStatus,
      contractNotes: contractRow.contractNotes,
      createdAt: contractRow.createdAt,
      updatedAt: contractRow.updatedAt,
      member: contractRow.memberId ? {
        id: contractRow.memberId,
        firstName: contractRow.memberFirstName,
        lastName: contractRow.memberLastName,
        email: contractRow.memberEmail,
        phone: contractRow.memberPhone,
        status: contractRow.memberStatus,
      } : null,
      trainer: contractRow.initialTrainerId ? {
        id: contractRow.initialTrainerId,
        firstName: contractRow.trainerFirstName,
        lastName: contractRow.trainerLastName,
      } : null,
    };

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 });
  }
}
