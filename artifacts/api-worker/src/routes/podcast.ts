import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { createD1Db, mediaTable } from "@workspace/db";
import type { Env } from "../index";

/* ═══════════════════════════════════════════════════════════════
   Podcast RSS — iTunes-compatible RSS 2.0 feed per user.

   Uses the `podcast` npm package (MIT) for feed generation.
   Episodes = user's audio recordings from the media table.
   Public route — no auth required (userId in URL path).
   ═══════════════════════════════════════════════════════════════ */

const app = new Hono<{ Bindings: Env }>();

app.get("/:userId/feed.xml", async (c) => {
  const db = createD1Db(c.env.DB);
  const userId = c.req.param("userId");

  const audioMedia = await db.select().from(mediaTable).where(and(
    eq(mediaTable.userId, userId),
    eq(mediaTable.kind, "audio"),
  ));

  const { Podcast } = await import("podcast");
  const feed = new Podcast({
    title: "My Origin Journey",
    description: "A seven-chapter guided self-discovery journey, told in the author's own voice.",
    author: "Origin · Metamyth",
    siteUrl: "https://mymetamyth.templeearth.cc",
    imageUrl: "https://mymetamyth.templeearth.cc/logo.svg",
  });

  for (const media of audioMedia) {
    feed.addItem({
      title: media.originalName || `Episode ${media.id.slice(0, 8)}`,
      description: "A reflection from the Origin journey.",
      url: `https://mymetamyth.templeearth.cc/api/media/${media.id}`,
      date: media.createdAt,
    });
  }

  c.header("Content-Type", "application/rss+xml; charset=utf-8");
  c.header("Cache-Control", "public, max-age=300");
  return c.body(feed.buildXml());
});

export default app;
