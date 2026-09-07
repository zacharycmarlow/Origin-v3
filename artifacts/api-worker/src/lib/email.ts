import { Resend } from 'resend';
import type { Env } from '../index';

/* ═══════════════════════════════════════════════════════════════
   Email — transactional email via Resend (MIT).

   Requires RESEND_API_KEY in the Worker environment.
   ═══════════════════════════════════════════════════════════════ */

export async function sendWelcomeEmail(env: Env, email: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Origin <noreply@metamyth.org>',
    to: email,
    subject: 'Welcome to Origin · A Metamyth Journey',
    html: `<p>Welcome to Origin.</p><p>Your seven-chapter journey begins when you're ready. Take your time.</p><p>— The Metamyth team</p>`,
  });
}
