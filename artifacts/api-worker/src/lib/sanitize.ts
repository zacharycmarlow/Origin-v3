/* ═══════════════════════════════════════════════════════════════
   HTML sanitization for server-side use on Cloudflare Workers.

   DOMPurify requires a DOM, so it is frontend-only. This lightweight
   sanitizer strips <script> tags and on* event-handler attributes
   from HTML strings before storing user input in D1.

   Custom code: ~100% (simple regex-based sanitizer).
   ═══════════════════════════════════════════════════════════════ */

/**
 * Strip <script>...</script> blocks and on* event-handler attributes
 * from an HTML string. Also removes javascript: URLs.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return input;

  let out = input;

  // Remove <script>...</script> blocks (case-insensitive, multiline)
  out = out.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove on* event-handler attributes (e.g. onclick, onload, onerror)
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Remove javascript: URLs in href/src attributes
  out = out.replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, "$1=\"#\"");

  return out;
}

/**
 * Recursively sanitize all string values in a JSON-serializable object.
 * Returns a new object; does not mutate the input.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") return sanitizeHtml(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObject) as unknown as T;
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as unknown as T;
  }
  return obj;
}
