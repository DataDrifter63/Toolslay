"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { SITE } from "@/lib/constants";
import { CONTACT } from "@/data/contactSeo";

// Messages are delivered to SITE.email through Web3Forms (https://web3forms.com).
// Create a free access key for that inbox and set NEXT_PUBLIC_WEB3FORMS_KEY in .env.local
// and in the Cloudflare Pages environment variables. Without a key the form falls back
// to opening the visitor's email app (mailto), so it never silently loses a message.
const ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INITIAL = {
  name: "",
  email: "",
  topic: CONTACT.topics[0].value,
  page: "",
  message: "",
  website: "", // honeypot: real visitors never see or fill this
};

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function topicLabel(value) {
  return CONTACT.topics.find((t) => t.value === value)?.label || "Message";
}

function validate(form) {
  if (form.name.trim().length < 2) return "Please enter your name.";
  if (!EMAIL_RE.test(form.email.trim())) return "Please enter a valid email address so we can reply.";
  if (form.message.trim().length < 15) return "Please write a few more words so we can understand your message.";
  return "";
}

export default function ContactForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");

    // A filled honeypot means a bot. Pretend it worked and send nothing.
    if (form.website) {
      router.push("/thank-you");
      return;
    }

    setSubmitting(true);
    const label = topicLabel(form.topic);

    if (!ACCESS_KEY) {
      const subject = encodeURIComponent(`[${label}] Message from ${form.name.trim()} via ${SITE.name}`);
      const body = encodeURIComponent(
        `${form.message.trim()}\n\n${form.page.trim() ? `Page or tool: ${form.page.trim()}\n` : ""}From: ${form.name.trim()} (${form.email.trim()})`
      );
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
      window.setTimeout(() => router.push("/thank-you?via=email"), 400);
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `[${label}] New message from ${form.name.trim()} via ${SITE.name}`,
          from_name: SITE.name,
          name: form.name.trim(),
          email: form.email.trim(),
          topic: label,
          page_or_tool: form.page.trim() || "Not given",
          message: form.message.trim(),
          botcheck: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        router.push("/thank-you");
        return;
      }
      throw new Error(data.message || "Request failed");
    } catch {
      setError(`Sorry, that did not go through. Please try again, or email us at ${SITE.email}.`);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Your name" id="contact-name">
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={form.name}
            onChange={handleChange}
            className={FIELD_CLASS}
          />
        </Field>
        <Field label="Your email" id="contact-email">
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            value={form.email}
            onChange={handleChange}
            className={FIELD_CLASS}
          />
        </Field>
      </div>

      <Field label="What is this about?" id="contact-topic">
        <select
          id="contact-topic"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          className={`${FIELD_CLASS} cursor-pointer`}
        >
          {CONTACT.topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tool name or page address" id="contact-page" optional>
        <input
          id="contact-page"
          name="page"
          type="text"
          maxLength={200}
          placeholder="For example: Word Counter, or toolslay.com/tools/word-counter"
          value={form.page}
          onChange={handleChange}
          className={FIELD_CLASS}
        />
      </Field>

      <Field label="Your message" id="contact-message">
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={3000}
          placeholder="Tell us what happened, what you expected, and the values you entered."
          value={form.message}
          onChange={handleChange}
          className={FIELD_CLASS}
        />
        <span className="mt-1 block text-right text-[11px] text-muted">{form.message.length} / 3000</span>
      </Field>

      {/* Honeypot field, hidden from people and screen readers */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} aria-hidden="true" /> Send message
          </>
        )}
      </button>

      <p className="text-xs leading-relaxed text-muted">
        We use your name and email only to reply. Read our{" "}
        <Link href="/privacy-policy" className="text-brand underline">
          Privacy Policy
        </Link>{" "}
        for details.
      </p>
    </form>
  );
}

function Field({ label, id, optional = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
        {optional && <span className="ml-1 font-normal text-muted/70">(optional)</span>}
      </label>
      {children}
    </div>
  );
}
