import { render } from "react-email";
import ConfirmEmail, { CONFIRM_SUBJECT, confirmEmailText } from "@/emails/confirm-email";
import WelcomeEmail, { WELCOME_SUBJECT, welcomeEmailText } from "@/emails/welcome-email";
import type { OutgoingEmail } from "./resend";

export async function confirmationEmail(to: string, confirmUrl: string): Promise<OutgoingEmail> {
  return {
    to,
    subject: CONFIRM_SUBJECT,
    html: await render(<ConfirmEmail confirmUrl={confirmUrl} />),
    text: confirmEmailText(confirmUrl),
  };
}

export async function welcomeEmail(to: string): Promise<OutgoingEmail> {
  return {
    to,
    subject: WELCOME_SUBJECT,
    html: await render(<WelcomeEmail />),
    text: welcomeEmailText(),
  };
}
