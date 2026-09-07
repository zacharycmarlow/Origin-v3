/* ═══════════════════════════════════════════════════════════════
   Audit logging helper.

   Inserts entries into the `audit_log` D1 table for sensitive
   operations (account deletion, media upload, media delete).
   ═══════════════════════════════════════════════════════════════ */

import { createD1Db, auditLogTable } from "@workspace/db";

type D1Db = ReturnType<typeof createD1Db>;

export interface AuditEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  /** Optional structured metadata; not stored in D1, logged to console. */
  metadata?: Record<string, unknown>;
}

/**
 * Insert an audit log entry. Failures are swallowed (logged to console)
 * so they never break the main request flow. Optional `metadata` is
 * emitted to the console alongside the persisted row since the
 * `audit_log` table has no metadata column.
 */
export async function auditLog(db: D1Db, entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLogTable).values({
      id: crypto.randomUUID(),
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      createdAt: new Date().toISOString(),
    });
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log("[audit]", entry.action, JSON.stringify(entry.metadata));
    }
  } catch (err) {
    console.error("[audit] failed to insert audit log:", err);
  }
}
