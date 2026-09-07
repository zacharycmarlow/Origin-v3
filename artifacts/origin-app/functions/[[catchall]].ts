/* Cloudflare Pages Function — proxies /api/* to the origin-api Worker.
 *
 * Uses a root-level catch-all so all /api/* paths (including nested
 * ones like /api/user/state) are forwarded to the Worker. Non-API
 * paths fall through to the static assets. */

const DEFAULT_WORKER_URL = "https://origin-api.terexmaps.workers.dev";

export const onRequest: PagesFunction = async (c) => {
  const reqUrl = new URL(c.request.url);
  const pathname = reqUrl.pathname;

  // Only proxy /api/* paths; everything else falls through to static assets
  if (!pathname.startsWith("/api/") && pathname !== "/api") {
    return c.next();
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
