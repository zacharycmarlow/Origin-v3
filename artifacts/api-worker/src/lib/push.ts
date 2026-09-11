import webpush from 'web-push';
import type { Env } from '../index';

/* ═══════════════════════════════════════════════════════════════
   Push notifications — web-push (MIT).

   Requires VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in the Worker env.
   ═══════════════════════════════════════════════════════════════ */

export function configurePush(env: Env): void {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:noreply@metamyth.org',
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );
  }
}

export async function sendNotification(
  env: Env,
  subscription: webpush.PushSubscription,
  payload: string,
): Promise<void> {
  configurePush(env);
  await webpush.sendNotification(subscription, payload);
}
