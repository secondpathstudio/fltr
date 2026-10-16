import { Text } from "react-email";
import { EmailLayout, EmailTerm, emailStyles } from "./layout";

export const WELCOME_SUBJECT = "You're on the fltr waitlist";

export function welcomeEmailText(): string {
  return [
    "You're on the list. We'll email you when fltr opens.",
    "",
    "Open source. No ads, ever. We'll only email you about the launch.",
  ].join("\n");
}

export default function WelcomeEmail() {
  return (
    <EmailLayout preview="You're on the list. We'll email you when fltr opens.">
      <Text style={emailStyles.text}>
        You&apos;re on the list. We&apos;ll email you when <EmailTerm>fltr</EmailTerm> opens.
      </Text>
      <Text style={emailStyles.muted}>Open source. No ads, ever. We&apos;ll only email you about the launch.</Text>
    </EmailLayout>
  );
}
