/* Cloudflare Pages Function — proxies /api/* to the origin-api Worker.
 *
 * Uses a root-level catch-all so all /api/* paths (including nested
 * ones like /api/user/state) are forwarded to the Worker. Non-API
 * paths fall through to the static assets, with appropriate
 * Cache-Control headers added to the asset response. */

const DEFAULT_WORKER_URL = "https://origin-api.hardwoodstablecoin.workers.dev";

/** Cache-Control for hashed, content-addressed bundle assets. */
const ASSETS_CACHE = "public, max-age=31536000, immutable";
/** Cache-Control for other static files (HTML, root files, etc.). */
const STATIC_CACHE = "public, max-age=3600";

export const onRequest: PagesFunction = async (c) => {
  const reqUrl = new URL(c.request.url);
  const pathname = reqUrl.pathname;

  // Only proxy /api/* paths; everything else falls through to static assets
  if (!pathname.startsWith("/api/") && pathname !== "/api") {
    const res = await c.next();

    // Don't override cache headers if the asset pipeline already set them.
    const existing = res.headers.get("Cache-Control");
    if (existing) return res;

    // Vite-emitted hashed assets live under /assets/* and are safe to
    // cache forever. Everything else (e.g. index.html, favicon) gets a
    // short, revalidate-friendly cache.
    const cacheControl = pathname.startsWith("/assets/")
      ? ASSETS_CACHE
      : STATIC_CACHE;

    const headers = new Headers(res.headers);
    headers.set("Cache-Control", cacheControl);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  const workerUrl = (c.env as Record<string, string>).API_WORKER_URL || DEFAULT_WORKER_URL;
  const targetUrl = new URL(pathname, workerUrl);
  targetUrl.search = reqUrl.search;

  const headers = new Headers(c.request.headers);
  headers.delete("host");

  const res = await fetch(targetUrl.toString(), {
    method: c.request.method,
    headers,
    body: c.request.method !== "GET" && c.request.method !== "HEAD" ? c.request.body : undefined,
    redirect: "manual",
  });

  return res;
};
