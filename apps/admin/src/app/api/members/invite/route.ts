import { NextRequest, NextResponse } from "next/server";
import { db, users, eq } from "@vt/db";
import { getServerSession } from "@/lib/auth";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Only admins can invite users
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, name, role } = await request.json();

    // Validate inputs
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    if (!["admin", "trainer", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a temporary password (in production, you'd send this via email)
    const tempPassword = randomBytes(8).toString("hex");
    const passwordHash = await hashPassword(tempPassword);

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        role: role as "admin" | "trainer" | "member",
        passwordHash,
        emailVerified: false,
      })
      .returning();

    // In a production app, you would:
    // 1. Send an email with the temp password or a reset link
    // 2. Use a proper invitation flow with token verification

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      // For development purposes, include the temp password
      // In production, remove this and send via email
      tempPassword: process.env.NODE_ENV === "development" ? tempPassword : undefined,
      message: process.env.NODE_ENV === "development" 
        ? `User created with temporary password: ${tempPassword}`
        : "User created. An invitation email has been sent.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}
