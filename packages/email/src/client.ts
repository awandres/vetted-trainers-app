import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

// Types
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Default from address
const DEFAULT_FROM = process.env.EMAIL_FROM || "Vetted Trainers <noreply@vettedtrainers.com>";

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Error sending email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Send a batch of emails
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  const results = await Promise.all(emails.map(sendEmail));
  return results;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
