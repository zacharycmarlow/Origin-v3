/* Reset script — clear local D1 data for fresh dev.
 * Usage: pnpm tsx scripts/reset.ts
 */
async function main() {
  console.log('Reset script ready. Use:');
  console.log('  wrangler d1 execute origin-db --local --command="DELETE FROM journal_entries;"');
  console.log('  wrangler d1 execute origin-db --local --command="DELETE FROM readings;"');
  console.log('  wrangler d1 execute origin-db --local --command="DELETE FROM media;"');
}

main().catch(console.error);
