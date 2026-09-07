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
