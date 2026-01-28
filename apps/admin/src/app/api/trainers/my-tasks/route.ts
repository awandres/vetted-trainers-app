import { NextRequest, NextResponse } from "next/server";
import { db, vtTasks, vtTrainers, vtMembers, eq, desc, and, or, isNull, lte, not } from "@vt/db";
import { getServerSession } from "@/lib/auth";
import { createId } from "@vt/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "all", "pending", "completed"
    const includeAuto = searchParams.get("includeAuto") === "true";

    // Get the trainer ID for this user
    let trainerId = session.user.trainerId;

    if (!trainerId && session.user.role === "trainer") {
      const [trainer] = await db
        .select({ id: vtTrainers.id })
        .from(vtTrainers)
        .where(eq(vtTrainers.email, session.user.email))
        .limit(1);
      
      trainerId = trainer?.id;
    }

    if (!trainerId && session.user.role !== "admin") {
      return NextResponse.json({ 
        tasks: [],
        autoTasks: [],
        message: "No trainer profile linked to this account"
      });
    }

    // Fetch manual tasks for this trainer
    let conditions = [];
    if (trainerId) {
      conditions.push(eq(vtTasks.ownerId, trainerId));
    }
    if (status === "pending") {
      conditions.push(not(eq(vtTasks.status, "done")));
    } else if (status === "completed") {
      conditions.push(eq(vtTasks.status, "done"));
    }

    const tasks = await db
      .select()
      .from(vtTasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vtTasks.dueDate), desc(vtTasks.createdAt))
      .limit(50);

    // Generate auto-tasks based on member data
    const autoTasks = [];
    
    if (includeAuto && trainerId) {
      // Find members needing attention
      const membersNeedingAttention = await db
        .select({
          id: vtMembers.id,
          firstName: vtMembers.firstName,
          lastName: vtMembers.lastName,
          status: vtMembers.status,
          daysSinceVisit: vtMembers.daysSinceVisit,
          lastVisitDate: vtMembers.lastVisitDate,
        })
        .from(vtMembers)
        .where(
          and(
            eq(vtMembers.trainerId, trainerId),
            or(
              eq(vtMembers.status, "inactive"),
              eq(vtMembers.status, "churned")
            )
          )
        )
        .limit(10);

      for (const member of membersNeedingAttention) {
        autoTasks.push({
          id: `auto-followup-${member.id}`,
          type: "follow_up",
          title: `Follow up with ${member.firstName} ${member.lastName}`,
          description: member.status === "churned" 
            ? `Haven't trained in ${member.daysSinceVisit || 45}+ days`
            : `Inactive for ${member.daysSinceVisit || 14}+ days`,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          priority: member.status === "churned" ? "high" : "medium",
          dueDate: null,
          isAuto: true,
        });
      }
    }

    return NextResponse.json({
      tasks,
      autoTasks,
      stats: {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== "done").length,
        overdue: tasks.filter(t => 
          t.status !== "done" && 
          t.dueDate && 
          new Date(t.dueDate) < new Date()
        ).length,
      }
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the trainer ID for this user
    let trainerId = session.user.trainerId;

    if (!trainerId && session.user.role === "trainer") {
      const [trainer] = await db
        .select({ id: vtTrainers.id, name: vtTrainers.name })
        .from(vtTrainers)
        .where(eq(vtTrainers.email, session.user.email))
        .limit(1);
      
      trainerId = trainer?.id;
    }

    const [newTask] = await db
      .insert(vtTasks)
      .values({
        id: createId(),
        title,
        description,
        priority: priority || "medium",
        status: "not_started",
        ownerId: trainerId,
        ownerName: session.user.name || session.user.email,
        dueDate: dueDate || null,
      })
      .returning();

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, title, description, priority, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === "done") {
        updateData.completedAt = new Date();
      }
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const [updatedTask] = await db
      .update(vtTasks)
      .set(updateData)
      .where(eq(vtTasks.id, id))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const [deletedTask] = await db
      .delete(vtTasks)
      .where(eq(vtTasks.id, id))
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
