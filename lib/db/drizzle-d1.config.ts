import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema-d1/index.ts",
  out: "./drizzle-d1",
  dialect: "sqlite",
});
