'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import { track } from '@/lib/analytics';

/**
 * Interim form: packages the message into a mailto so it works with zero
 * backend on the static export. Phase 3 swaps the submit handler for the
 * Cloudflare Worker → Routine pipeline (see shared stack contract).
 */
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    track('contact_form_send', { page: window.location.pathname });

    const subject = `Project inquiry from ${name || 'your website'}`;
    const body = `${message}\n\n${name}${email ? ` (${email})` : ''}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        What are you building, and what&rsquo;s in the way?
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      <div>
        <button className="button" type="submit">
          Send
        </button>
      </div>
      <p className="form-note">
        Sending opens your mail app with the message ready to go. Nothing is
        stored here. Prefer to write directly? {SITE.email}
      </p>
    </form>
  );
}
