import { NextRequest, NextResponse } from "next/server";
import { db, vtAutomatedEmails, vtAutomatedEmailLogs, vtMembers, eq, and } from "@vt/db";
import { sendEmail, renderTemplate } from "@vt/email";

interface TriggerPayload {
  trigger: string;
  memberId?: string;
  recipientEmail?: string;
  recipientName?: string;
  data?: Record<string, unknown>;
}

// POST - Trigger an automated email
export async function POST(request: NextRequest) {
  try {
    const body: TriggerPayload = await request.json();
    const { trigger, memberId, recipientEmail, recipientName, data } = body;

    if (!trigger) {
      return NextResponse.json({ error: "Trigger type is required" }, { status: 400 });
    }

    // Find all active automated emails for this trigger
    const automatedEmails = await db
      .select()
      .from(vtAutomatedEmails)
      .where(
        and(
          eq(vtAutomatedEmails.trigger, trigger),
          eq(vtAutomatedEmails.isActive, true)
        )
      );

    if (automatedEmails.length === 0) {
      return NextResponse.json({ 
        message: "No active automated emails for this trigger",
        triggered: 0
      });
    }

    // Get member info if memberId provided
    let member = null;
    if (memberId) {
      const [memberResult] = await db
        .select()
        .from(vtMembers)
        .where(eq(vtMembers.id, memberId));
      member = memberResult;
    }

    const finalEmail = recipientEmail || member?.email;
    const finalName = recipientName || member?.firstName || "Member";

    if (!finalEmail) {
      return NextResponse.json({ error: "No recipient email provided or found" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const autoEmail of automatedEmails) {
      // Skip if trigger mode is disabled
      if (autoEmail.triggerMode === "disabled") {
        continue;
      }

      // For optional emails, we still send but could add user preference check here
      // if (autoEmail.triggerMode === "optional") { ... check user preferences ... }

      try {
        // Build template props with dynamic data
        const templateData = (autoEmail.templateData as Record<string, unknown>) || {};
        const templateProps: Record<string, unknown> = {
          headline: templateData.headline || autoEmail.name,
          previewText: autoEmail.previewText || "",
          recipientName: finalName,
          ...templateData,
          // Merge in trigger-specific data
          ...data,
        };

        // Render the template
        const html = await renderTemplate({
          template: (autoEmail.templateType || "reminder") as "newsletter" | "promotion" | "reminder",
          props: templateProps,
        });

        // Personalize subject line
        let subject = autoEmail.subject;
        subject = subject.replace(/\{\{name\}\}/gi, finalName);
        subject = subject.replace(/\{\{firstName\}\}/gi, finalName);

        // Determine recipient(s) - use test emails if in test mode
        let sendToEmails: string[] = [finalEmail];
        let isTestMode = false;
        
        if (autoEmail.testMode && autoEmail.testEmails) {
          isTestMode = true;
          sendToEmails = autoEmail.testEmails
            .split(",")
            .map((e: string) => e.trim())
            .filter(Boolean);
          
          // Prefix subject with [TEST] to make it clear
          subject = `[TEST] ${subject}`;
        }

        // Log the trigger attempt
        const [log] = await db
          .insert(vtAutomatedEmailLogs)
          .values({
            automatedEmailId: autoEmail.id,
            recipientEmail: isTestMode ? sendToEmails.join(", ") : finalEmail,
            memberId: memberId || null,
            triggerData: { ...data, testMode: isTestMode, originalRecipient: finalEmail },
            status: "pending",
          })
          .returning();

        // Send the email to all recipients
        let allSuccess = true;
        let lastError = "";
        let lastId = "";
        
        for (const toEmail of sendToEmails) {
          const result = await sendEmail({
            to: toEmail,
            subject,
            html,
          });
          
          if (!result.success) {
            allSuccess = false;
            lastError = result.error || "Unknown error";
          } else {
            lastId = result.id || "";
          }
        }
        
        const result = { success: allSuccess, error: lastError, id: lastId };

        if (result.success) {
          // Update log to sent
          await db
            .update(vtAutomatedEmailLogs)
            .set({
              status: "sent",
              sentAt: new Date(),
              resendMessageId: result.id,
            })
            .where(eq(vtAutomatedEmailLogs.id, log.id));

          // Update automated email stats
          await db
            .update(vtAutomatedEmails)
            .set({
              sentCount: (autoEmail.sentCount || 0) + 1,
              lastSentAt: new Date(),
            })
            .where(eq(vtAutomatedEmails.id, autoEmail.id));

          results.push({
            automatedEmailId: autoEmail.id,
            name: autoEmail.name,
            status: "sent",
            testMode: isTestMode,
            sentTo: isTestMode ? sendToEmails : [finalEmail],
          });
        } else {
          // Update log to failed
          await db
            .update(vtAutomatedEmailLogs)
            .set({
              status: "failed",
              errorMessage: result.error,
            })
            .where(eq(vtAutomatedEmailLogs.id, log.id));

          errors.push({
            automatedEmailId: autoEmail.id,
            name: autoEmail.name,
            error: result.error,
          });
        }
      } catch (err) {
        errors.push({
          automatedEmailId: autoEmail.id,
          name: autoEmail.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      triggered: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error triggering automated email:", error);
    return NextResponse.json({ error: "Failed to trigger automated email" }, { status: 500 });
  }
}
