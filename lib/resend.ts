import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface WaitlistMailer {
  sendEmail(email: OutgoingEmail): Promise<void>;
  /** Saves the contact in the Waitlist segment, opted in to Launch updates. */
  addToWaitlist(email: string): Promise<{ created: boolean }>;
}

type ResendError = { message: string; statusCode: number | null; name: string };

export class ResendRequestError extends Error {
  constructor(step: string, error: ResendError) {
    super(`Resend ${step} failed: ${error.name} (${error.statusCode ?? "no status"}): ${error.message}`);
    this.name = "ResendRequestError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/**
 * Resend doesn't document a dedicated error code for duplicates, so match the
 * HTTP conflict status and the "already exists" wording it returns.
 */
export function isAlreadyExistsError(error: ResendError): boolean {
  return error.statusCode === 409 || /already (exists|a member|in)/i.test(error.message);
}

function createResendMailer(): WaitlistMailer {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const from = process.env.EMAIL_FROM || "FLTR <hello@fltr.world>";

  return {
    async sendEmail({ to, subject, html, text }) {
      const { error } = await resend.emails.send({ from, to, subject, html, text });
      if (error) throw new ResendRequestError("emails.send", error);
    },

    async addToWaitlist(email) {
      const segmentId = requireEnv("RESEND_WAITLIST_SEGMENT_ID");
      const topicId = requireEnv("RESEND_LAUNCH_TOPIC_ID");

      const created = await resend.contacts.create({
        email,
        unsubscribed: false,
        segments: [{ id: segmentId }],
        topics: [{ id: topicId, subscription: "opt_in" }],
      });
      if (!created.error) return { created: true };
      if (!isAlreadyExistsError(created.error)) throw new ResendRequestError("contacts.create", created.error);

      // Existing contact (a re-confirmation, or someone already on another list):
      // make sure they're in the segment and opted in to launch updates.
      const added = await resend.contacts.segments.add({ email, segmentId });
      if (added.error && !isAlreadyExistsError(added.error)) {
        throw new ResendRequestError("contacts.segments.add", added.error);
      }
      const topics = await resend.contacts.topics.update({
        email,
        topics: [{ id: topicId, subscription: "opt_in" }],
      });
      if (topics.error) throw new ResendRequestError("contacts.topics.update", topics.error);
      return { created: false };
    },
  };
}

/**
 * Local stand-in for Resend that writes to JSON files, for development without
 * an API key and for the Playwright test. Never used on Vercel.
 */
function createOutboxMailer(dir: string): WaitlistMailer {
  async function append(file: string, entry: unknown) {
    await mkdir(dir, { recursive: true });
    const path = join(dir, file);
    let entries: unknown[] = [];
    try {
      entries = JSON.parse(await readFile(path, "utf8"));
    } catch {
      // First write.
    }
    entries.push(entry);
    await writeFile(path, JSON.stringify(entries, null, 2));
  }

  return {
    async sendEmail(email) {
      await append("emails.json", { ...email, sentAt: new Date().toISOString() });
      console.info(`[outbox] wrote "${email.subject}" to ${join(dir, "emails.json")}`);
    },
    async addToWaitlist(email) {
      let contacts: { email: string }[] = [];
      try {
        contacts = JSON.parse(await readFile(join(dir, "contacts.json"), "utf8"));
      } catch {
        // No contacts yet.
      }
      if (contacts.some((c) => c.email === email)) return { created: false };
      await append("contacts.json", { email, segment: "Waitlist", topic: "Launch updates: opt_in" });
      return { created: true };
    },
  };
}

function outboxDir(): string | undefined {
  if (process.env.VERCEL) return undefined;
  if (process.env.RESEND_MOCK_OUTBOX) return process.env.RESEND_MOCK_OUTBOX;
  if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) return ".outbox";
  return undefined;
}

export function getMailer(): WaitlistMailer {
  const dir = outboxDir();
  return dir ? createOutboxMailer(dir) : createResendMailer();
}
