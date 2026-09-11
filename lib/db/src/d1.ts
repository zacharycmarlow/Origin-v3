import { drizzle } from "drizzle-orm/d1";
import * as schemaD1 from "./schema-d1";

/* D1 client for Cloudflare Workers.
   Usage: const db = createD1Db(env.DB);

   The D1Database type is provided by @cloudflare/workers-types.
   We use a loose type here so this module compiles without the
   workers types installed (the db package is shared between
   Node.js and Workers environments). */
export function createD1Db(d1: unknown) {
  return drizzle(d1 as Parameters<typeof drizzle>[0], { schema: schemaD1 });
}

export * as schemaD1 from "./schema-d1";
export * from "./schema-d1";
