"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const MESSAGES = {
  invalid_email: "That doesn't look like an email address. Check for typos and try again.",
  rate_limited: "That's a lot of tries in a short time. Wait a few minutes and try again.",
  server_error: "Something went wrong on our side. Try again in a minute.",
} as const;

type ErrorCode = keyof typeof MESSAGES;

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorCode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("invalid_email");
      setStatus("error");
      inputRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          company: String(data.get("company") ?? ""),
          // Time since page load, for the server's 2-second bot check.
          elapsedMs: Math.round(performance.now()),
        }),
      });
      if (response.ok) {
        setStatus("success");
        return;
      }
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      const code = body?.error && body.error in MESSAGES ? (body.error as ErrorCode) : "server_error";
      setError(code);
    } catch {
      setError("server_error");
    }
    setStatus("error");
    inputRef.current?.focus();
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-2xl border-2 border-primary bg-label px-5 py-4 text-lg font-bold text-ink shadow-riso-sm">
        Almost there. Check your inbox and click the link to confirm your spot.
      </p>
    );
  }

  const hasError = status === "error" && error !== null;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <label htmlFor="waitlist-email" className="block font-bold text-ink">
        Email address
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          ref={inputRef}
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "waitlist-error waitlist-note" : "waitlist-note"}
          className="min-w-0 flex-[1_1_260px] rounded-xl border-2 border-primary bg-surface px-4 py-3 text-lg text-ink placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-xl border-2 border-primary bg-primary px-5 py-3 text-lg font-bold text-on-primary shadow-riso-sm hover:translate-x-px hover:translate-y-px disabled:cursor-wait"
        >
          Join the waitlist
        </button>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="waitlist-company">Company</label>
        <input id="waitlist-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {hasError && (
        <p id="waitlist-error" className="mt-3 border-l-4 border-accent pl-3 font-bold text-ink">
          {MESSAGES[error]}
        </p>
      )}
      <p id="waitlist-note" className="mt-4 text-base text-muted">
        Open source. No ads, ever. We&apos;ll only email you about the launch.
      </p>
      <p className="mt-2 text-base">
        <Link href="/privacy" className="text-primary underline underline-offset-4">
          How we handle your email
        </Link>
      </p>
    </form>
  );
}
