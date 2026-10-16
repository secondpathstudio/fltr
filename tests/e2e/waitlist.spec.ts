import { readFile, rm } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const OUTBOX = ".outbox-e2e";

interface SentEmail {
  to: string;
  subject: string;
  text: string;
}

async function sentEmails(): Promise<SentEmail[]> {
  try {
    return JSON.parse(await readFile(`${OUTBOX}/emails.json`, "utf8"));
  } catch {
    return [];
  }
}

test.beforeEach(async () => {
  await rm(OUTBOX, { recursive: true, force: true });
});

test("joining the waitlist sends a confirmation link that adds the contact", async ({ page }) => {
  await page.goto("/");
  // The form appears in the hero and in the Join section; use the Join one.
  const join = page.locator("#join");
  const email = join.getByLabel("Email address");

  // Plain-language error for a typo, linked to the field.
  await email.fill("ada@example");
  await join.getByRole("button", { name: "Join the waitlist" }).click();
  const error = join.getByText("That doesn't look like an email address. Check for typos and try again.");
  await expect(error).toBeVisible();
  await expect(email).toHaveAttribute("aria-describedby", /-error/);

  // The server ignores submits made under 2 seconds after load.
  await page.waitForTimeout(2100);
  await email.fill("  Ada@Example.com ");
  await join.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(join.getByRole("status")).toHaveText(
    "Almost there. Check your inbox and click the link to confirm your spot.",
  );

  await expect.poll(async () => (await sentEmails()).length).toBe(1);
  const [sent] = await sentEmails();
  expect(sent.to).toBe("ada@example.com");
  expect(sent.subject).toBe("Confirm your spot on the fltr waitlist");
  const link = sent.text.match(/https?:\/\/\S+\/confirm\?token=\S+/)?.[0];
  expect(link).toBeTruthy();

  await page.goto(link!);
  await expect(page.getByText("You're on the list. We'll email you when fltr opens.")).toBeVisible();
  const contacts = JSON.parse(await readFile(`${OUTBOX}/contacts.json`, "utf8"));
  expect(contacts).toEqual([{ email: "ada@example.com", segment: "Waitlist", topic: "Launch updates: opt_in" }]);

  // Clicking the link again is handled gracefully.
  await page.goto(link!);
  await expect(page.getByText("You're on the list. We'll email you when fltr opens.")).toBeVisible();
});

test("a tampered token shows the expired-link page", async ({ page }) => {
  await page.goto("/confirm?token=eyJlbWFpbCI6ImV2ZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OTk5OX0.forged");
  await expect(
    page.getByText("This link has expired or isn't valid. Head back to fltr.world and sign up again."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up again" })).toHaveAttribute("href", "/#join");
});

test("the honeypot silently accepts and sends nothing", async ({ request }) => {
  const response = await request.post("/api/waitlist", {
    data: { email: "bot@example.com", company: "Acme", elapsedMs: 5000 },
  });
  expect(await response.json()).toEqual({ ok: true });
  expect(await sentEmails()).toEqual([]);
});
