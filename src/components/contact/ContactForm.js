"use client";

import { useState } from "react";
import { SITE } from "@/lib/constants";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in every field before sending.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(`Message from ${form.name} via ${SITE.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} (${form.email})`);
    window.location.href = `mailto:hello@toolsslay.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Field label="Name" name="name" value={form.name} onChange={handleChange} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Message</span>
        <textarea
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {sent && <p className="text-sm text-teal">Your email app should now be open — send when ready.</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark"
      >
        Send message
      </button>
    </form>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
      />
    </label>
  );
}
