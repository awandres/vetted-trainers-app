// Email client and utilities
export {
  resend,
  sendEmail,
  sendBatchEmails,
  isValidEmail,
  type SendEmailOptions,
  type SendEmailResult,
} from "./client";

// Email templates
export { default as BaseTemplate, colors } from "./templates/BaseTemplate";
export { default as NewsletterTemplate } from "./templates/NewsletterTemplate";
export { default as PromotionTemplate } from "./templates/PromotionTemplate";
export { default as ReminderTemplate } from "./templates/ReminderTemplate";
export { default as PrescriptionTemplate } from "./templates/PrescriptionTemplate";

// Template rendering
import { render } from "@react-email/render";
export { render };

// Render helpers
import BaseTemplate from "./templates/BaseTemplate";
import NewsletterTemplate from "./templates/NewsletterTemplate";
import PromotionTemplate from "./templates/PromotionTemplate";
import ReminderTemplate from "./templates/ReminderTemplate";
import PrescriptionTemplate from "./templates/PrescriptionTemplate";
import * as React from "react";

type TemplateType = "newsletter" | "promotion" | "reminder" | "prescription";

interface RenderTemplateOptions {
  template: TemplateType;
  props: Record<string, unknown>;
}

/**
 * Render an email template to HTML
 */
export async function renderTemplate({ template, props }: RenderTemplateOptions): Promise<string> {
  let element: React.ReactElement;

  switch (template) {
    case "newsletter":
      element = React.createElement(NewsletterTemplate, props as React.ComponentProps<typeof NewsletterTemplate>);
      break;
    case "promotion":
      element = React.createElement(PromotionTemplate, props as React.ComponentProps<typeof PromotionTemplate>);
      break;
    case "reminder":
      element = React.createElement(ReminderTemplate, props as React.ComponentProps<typeof ReminderTemplate>);
      break;
    case "prescription":
      element = React.createElement(PrescriptionTemplate, props as React.ComponentProps<typeof PrescriptionTemplate>);
      break;
    default:
      throw new Error(`Unknown template type: ${template}`);
  }

  return render(element);
}
