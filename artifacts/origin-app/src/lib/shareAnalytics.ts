/* ═══════════════════════════════════════════════════════════════
   Share analytics — privacy-safe logging of share events.

   Tracks only: card type generated, platform selected.
   Never tracks content, text, or user-identifiable data.
   ═══════════════════════════════════════════════════════════════ */

export function logShareGenerated(cardType: string): void {
  console.debug('[share] generated:', cardType);
}

export function logSharePlatform(platform: string): void {
  console.debug('[share] platform:', platform);
}

/**
 * Unified share-event tracker. Records the destination a user shared to
 * (e.g. "web-share", "download", "bluesky") plus optional metadata such as
 * the card type. Never tracks content, text, or user-identifiable data.
 */
export function trackShare(
  destination: string,
  metadata?: { cardType?: string; [key: string]: unknown },
): void {
  logSharePlatform(destination);
  if (metadata?.cardType) {
    logShareGenerated(metadata.cardType);
  }
  console.debug('[share] tracked:', destination, metadata ?? {});
}
