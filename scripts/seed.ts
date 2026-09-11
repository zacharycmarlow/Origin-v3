/* Seed script — populate D1 with sample data for local dev.
 * Usage: pnpm tsx scripts/seed.ts
 */
import { drizzle } from 'drizzle-orm/d1';
import { journalEntriesTable, readingsTable } from '../lib/db/src/schema-d1';

const SAMPLE_USER_ID = 'seed-user-0001';

async function main() {
  // This script is a template — wire to your local D1 via wrangler d1 execute.
  console.log('Seed script ready. Use: wrangler d1 execute origin-db --local --command="..."');
  console.log('Sample user ID:', SAMPLE_USER_ID);
}

main().catch(console.error);
