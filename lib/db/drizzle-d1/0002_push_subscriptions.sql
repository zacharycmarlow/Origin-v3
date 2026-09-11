-- Push subscriptions table for web-push notifications.
-- Stores one row per device/browser subscription. The full
-- PushSubscription JSON object is stored as a string in `subscription`.
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`subscription` text NOT NULL,
	`created_at` text DEFAULT '2026-09-07T21:15:00.504Z' NOT NULL
);--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_id_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `push_subscriptions_endpoint_idx` ON `push_subscriptions` (`endpoint`);
