import { Button, Link, Section, Text } from "react-email";
import { EmailLayout, emailStyles } from "./layout";

export const CONFIRM_SUBJECT = "Confirm your spot on the FLTR waitlist";

export function confirmEmailText(confirmUrl: string): string {
  return [
    "Confirm your email to join the FLTR waitlist.",
    "",
    `Confirm my spot: ${confirmUrl}`,
    "",
    "If you didn't sign up, ignore this email.",
  ].join("\n");
}

export default function ConfirmEmail({ confirmUrl = "https://fltr.world/confirm?token=example" }: { confirmUrl?: string }) {
  return (
    <EmailLayout preview="Confirm your email to join the FLTR waitlist.">
      <Text style={emailStyles.text}>Confirm your email to join the FLTR waitlist.</Text>
      <Section style={{ margin: "8px 0 24px" }}>
        <Button href={confirmUrl} style={emailStyles.button}>
          Confirm my spot
        </Button>
      </Section>
      <Text style={emailStyles.muted}>
        Or paste this link into your browser:{" "}
        <Link href={confirmUrl} style={emailStyles.link}>
          {confirmUrl}
        </Link>
      </Text>
      <Text style={emailStyles.muted}>If you didn&apos;t sign up, ignore this email.</Text>
    </EmailLayout>
  );
}
