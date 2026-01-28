import { NextRequest, NextResponse } from "next/server";
import { db, users, eq } from "@vt/db";
import { getServerSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    // Only admins can update roles
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await request.json();

    // Validate role
    if (!["admin", "trainer", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, trainer, or member" },
        { status: 400 }
      );
    }

    // Don't allow users to demote themselves
    if (id === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot change your own admin role" },
        { status: 400 }
      );
    }

    // Update the user's role
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role: role as "admin" | "trainer" | "member",
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
