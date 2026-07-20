"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONTACT_EMAIL = "hello@anteclick.app";

const CATEGORIES = ["General question", "Feedback", "Bug report", "Business enquiry"];

/**
 * No backend collects this — submitting opens the visitor's own email
 * client via a mailto: link, pre-filled with what they typed. Nothing is
 * sent to or stored by RailTimer.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const subject = `[RailTimer] ${category}${name ? ` from ${name}` : ""}`;
    const bodyLines = [message, "", email ? `Reply to: ${email}` : ""].filter(Boolean);
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name (optional)</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1.5"
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Your email (optional, for a reply)</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-category">What&apos;s this about?</Label>
        <select
          id="contact-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>

      <Button type="submit">Open in your email app</Button>
      <p className="text-xs text-muted-foreground">
        This opens a pre-filled email to {CONTACT_EMAIL} in your own email app — nothing is
        collected or stored by RailTimer.
      </p>
    </form>
  );
}
