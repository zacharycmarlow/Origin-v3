CREATE TABLE `archive_unlocks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chapter_idx` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`unlocked_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `archive_unlocks_user_id_idx` ON `archive_unlocks` (`user_id`);--> statement-breakpoint
CREATE INDEX `archive_unlocks_user_chapter_idx` ON `archive_unlocks` (`user_id`,`chapter_idx`);--> statement-breakpoint
CREATE TABLE `birth_data` (
	`user_id` text PRIMARY KEY NOT NULL,
	`birth_date` text NOT NULL,
	`birth_time` text,
	`birth_place` text,
	`archetype_context` text,
	`computation` text,
	`created_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`chapter` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT '2026-09-07T19:33:24.152Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `journal_entries_user_id_idx` ON `journal_entries` (`user_id`);--> statement-breakpoint
CREATE INDEX `journal_entries_user_chapter_idx` ON `journal_entries` (`user_id`,`chapter`);--> statement-breakpoint
CREATE INDEX `journal_entries_kind_idx` ON `journal_entries` (`kind`);--> statement-breakpoint
CREATE TABLE `journey_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`tile_idx` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT '2026-09-07T19:33:24.152Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entry_id` text,
	`r2_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`kind` text NOT NULL,
	`original_name` text,
	`extracted_text` text,
	`publish_status` text DEFAULT 'private' NOT NULL,
	`created_at` text DEFAULT '2026-09-07T19:33:24.154Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_user_id_idx` ON `media` (`user_id`);--> statement-breakpoint
CREATE INDEX `media_entry_id_idx` ON `media` (`entry_id`);--> statement-breakpoint
CREATE INDEX `media_kind_idx` ON `media` (`kind`);--> statement-breakpoint
CREATE TABLE `pod_members` (
	`id` text PRIMARY KEY NOT NULL,
	`pod_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pod_members_pod_id_idx` ON `pod_members` (`pod_id`);--> statement-breakpoint
CREATE INDEX `pod_members_user_id_idx` ON `pod_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `pod_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`pod_id` text NOT NULL,
	`user_id` text NOT NULL,
	`scene_key` text NOT NULL,
	`shared` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pod_shares_pod_id_idx` ON `pod_shares` (`pod_id`);--> statement-breakpoint
CREATE INDEX `pod_shares_user_id_idx` ON `pod_shares` (`user_id`);--> statement-breakpoint
CREATE TABLE `pod_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`pod_id` text NOT NULL,
	`user_id` text NOT NULL,
	`chapter` integer NOT NULL,
	`submitted_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pod_submissions_pod_id_idx` ON `pod_submissions` (`pod_id`);--> statement-breakpoint
CREATE INDEX `pod_submissions_user_chapter_idx` ON `pod_submissions` (`user_id`,`chapter`);--> statement-breakpoint
CREATE TABLE `pods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`created_by` text NOT NULL,
	`gate` text DEFAULT 'strict' NOT NULL,
	`created_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pods_invite_code_unique` ON `pods` (`invite_code`);--> statement-breakpoint
CREATE INDEX `pods_created_by_idx` ON `pods` (`created_by`);--> statement-breakpoint
CREATE TABLE `readings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chapter` integer NOT NULL,
	`kind` text NOT NULL,
	`cumulative` integer DEFAULT false NOT NULL,
	`data` text NOT NULL,
	`created_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `readings_user_id_idx` ON `readings` (`user_id`);--> statement-breakpoint
CREATE INDEX `readings_user_chapter_kind_idx` ON `readings` (`user_id`,`chapter`,`kind`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`clerk_id` text,
	`submitted_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL,
	`payload` text NOT NULL,
	`ip_hash` text
);
--> statement-breakpoint
CREATE INDEX `submissions_user_id_idx` ON `submissions` (`user_id`);--> statement-breakpoint
CREATE INDEX `submissions_clerk_id_idx` ON `submissions` (`clerk_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT '2026-09-07T19:33:24.151Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-07T19:33:24.151Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`submitted_at` text DEFAULT '2026-09-07T19:33:24.153Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_email_unique` ON `waitlist` (`email`);--> statement-breakpoint
CREATE INDEX `waitlist_user_id_idx` ON `waitlist` (`user_id`);