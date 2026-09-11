/* ═══════════════════════════════════════════════════════════════
   HTML sanitization for server-side use on Cloudflare Workers.

   Uses `xss` (js-xss), a pure-JavaScript HTML sanitizer that works
   in any JS runtime including Cloudflare Workers (no DOM required).
   This replaces the previous hand-rolled regex sanitizer, which was
   vulnerable to bypasses (nested tags, attribute splitting, encoding
   tricks, etc.).

   Export names are kept (`sanitizeHtml` / `sanitizeObject`) so
   existing callers require no changes.

   Custom code: ~10% (recursive object walker + config).
   ═══════════════════════════════════════════════════════════════ */

import xss from "xss";

const xssOptions = {
  whiteList: {
    a: ["href", "title", "target", "rel"],
    b: [], i: [], em: [], strong: [], p: [], br: [],
    ul: [], ol: [], li: [], blockquote: [],
    h1: [], h2: [], h3: [],
    span: ["class"], div: ["class"],
    code: [], pre: [], hr: [],
  },
  onIgnoreTagAttr: (tag: string, name: string) => {
    if (/^on/i.test(name)) return "";
    return undefined;
  },
  safeAttrValue: (tag: string, name: string, value: string) => {
    if (name === "href") {
      if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
      return "";
    }
    return value;
  },
  onIgnoreTag: (tag: string) => {
    if (["script", "style", "iframe", "object", "embed", "form"].includes(tag)) {
      return "";
    }
    return undefined;
  },
};

/**
 * Sanitize an HTML string using the xss library.
 * Strips scripts, event-handler attributes, `javascript:` URLs, and
 * any other disallowed markup. Returns the cleaned HTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return input;
  return xss(input, xssOptions);
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
