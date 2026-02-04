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
import NewsletterTemplate from "./templates/NewsletterTemplate";
import PromotionTemplate from "./templates/PromotionTemplate";
import ReminderTemplate from "./templates/ReminderTemplate";
import PrescriptionTemplate from "./templates/PrescriptionTemplate";
import * as React from "react";

type TemplateType = "newsletter" | "promotion" | "reminder" | "prescription";

interface RenderTemplateOptions {
  template: TemplateType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
}

/**
 * Render an email template to HTML
 */
export async function renderTemplate({ template, props }: RenderTemplateOptions): Promise<string> {
  let element: React.ReactElement;

  switch (template) {
    case "newsletter":
      element = React.createElement(NewsletterTemplate, props);
      break;
    case "promotion":
      element = React.createElement(PromotionTemplate, props);
      break;
    case "reminder":
      element = React.createElement(ReminderTemplate, props);
      break;
    case "prescription":
      element = React.createElement(PrescriptionTemplate, props);
      break;
    default:
      throw new Error(`Unknown template type: ${template}`);
  }

  return render(element);
}
