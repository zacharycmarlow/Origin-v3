-- Add updated_at column to journal_entries for conflict resolution
ALTER TABLE `journal_entries` ADD COLUMN `updated_at` text DEFAULT '2026-09-07T21:15:00.502Z' NOT NULL;--> statement-breakpoint

-- Add updated_at column to readings for conflict resolution
ALTER TABLE `readings` ADD COLUMN `updated_at` text DEFAULT '2026-09-07T21:15:00.502Z' NOT NULL;--> statement-breakpoint

-- Audit log table for sensitive operations
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`created_at` text DEFAULT '2026-09-07T21:15:00.504Z' NOT NULL
);--> statement-breakpoint
CREATE INDEX `audit_log_user_id_idx` ON `audit_log` (`user_id`);
