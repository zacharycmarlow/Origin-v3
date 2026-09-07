import { Hono } from "hono";
import { google } from "googleapis";
import { requireAuth, type AuthVars } from "../middleware/auth";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   YouTube publishing — upload video with Metamyth branding.

   Uses googleapis (Apache-2.0) for YouTube Data API v3.
   Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.use("*", requireAuth);

/* GET /api/youtube/connect — returns OAuth URL */
app.get("/connect", (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) return c.json({ error: "YouTube not configured" }, 503);
  const oauth2 = new google.auth.OAuth2(
    c.env.GOOGLE_CLIENT_ID,
    c.env.GOOGLE_CLIENT_SECRET || "",
    `${new URL(c.req.url).origin}/api/youtube/callback`,
  );
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });
  return c.json({ data: { url } });
});

/* POST /api/youtube/upload — upload video with Metamyth branding */
app.post("/upload", async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) return c.json({ error: "YouTube not configured" }, 503);
  const userId = c.get("userId");
  const body = await c.req.json();
  const { accessToken, videoTitle, videoDescription, videoBlob } = body;

  if (!accessToken || !videoBlob) return c.json({ error: "Missing accessToken or videoBlob" }, 400);

  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: "v3", auth: oauth2 });

  const title = videoTitle || `Origin Reflection: ${new Date().toLocaleDateString()}`;
  const description = `${videoDescription || ""}\n\nCreated with Origin · A Metamyth Journey\nhttps://mymetamyth.templeearth.cc`;

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title, description, categoryId: "22" },
      status: { privacyStatus: "unlisted" },
    },
    media: { body: videoBlob },
  });

  return c.json({ data: { videoId: res.data.id, url: `https://www.youtube.com/watch?v=${res.data.id}` } });
});

export default app;
