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
}

/**
 * Insert an audit log entry. Failures are swallowed (logged to console)
 * so they never break the main request flow.
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
  } catch (err) {
    console.error("[audit] failed to insert audit log:", err);
  }
}
