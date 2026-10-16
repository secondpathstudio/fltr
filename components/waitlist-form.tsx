"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const MESSAGES = {
  invalid_email: "That doesn't look like an email address. Check for typos and try again.",
  rate_limited: "That's a lot of tries in a short time. Wait a few minutes and try again.",
  server_error: "Something went wrong on our side. Try again in a minute.",
} as const;

type ErrorCode = keyof typeof MESSAGES;

/** The waitlist signup, used in the hero and in the Join section. */
export function WaitlistForm({ showPrivacyLink = false }: { showPrivacyLink?: boolean }) {
  const id = useId();
  const ids = { email: `${id}-email`, error: `${id}-error`, note: `${id}-note`, company: `${id}-company` };
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

  const note = (
    <p id={ids.note} className="mt-3 text-[14px] text-muted">
      Open source. No ads, ever. We&apos;ll only email you about the launch.
      {showPrivacyLink && (
        <>
          {" "}
          <Link href="/privacy" className="text-fg underline underline-offset-4">
            How we handle your email
          </Link>
        </>
      )}
    </p>
  );

  if (status === "success") {
    return (
      <div className="max-w-xl">
        <p role="status" className="rounded border border-line px-4 py-3 font-mono text-[16px]">
          Almost there. Check your inbox and click the link to confirm your spot.
        </p>
        {note}
      </div>
    );
  }

  const hasError = status === "error" && error !== null;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <label htmlFor={ids.email} className="block text-[15px] text-muted">
        Email address
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          ref={inputRef}
          id={ids.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${ids.error} ${ids.note}` : ids.note}
          className="h-[50px] min-w-0 flex-[1_1_240px] rounded border border-line bg-surface px-3 font-mono text-[16px] text-fg placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="h-[50px] rounded border border-hi bg-hi px-5 font-mono text-[16px] font-bold text-on-hi disabled:cursor-wait"
        >
          Join the waitlist
        </button>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={ids.company}>Company</label>
        <input id={ids.company} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {hasError && (
        <p id={ids.error} className="mt-3 border-l-2 border-fg pl-3 text-[15px] text-fg">
          {MESSAGES[error]}
        </p>
      )}
      {note}
    </form>
  );
}
