CREATE TABLE `onboarding_email_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(100) NOT NULL DEFAULT '',
	`step_number` int NOT NULL,
	`scheduled_at` bigint NOT NULL,
	`sent_at` bigint,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`error_message` text,
	`created_at` bigint NOT NULL,
	CONSTRAINT `onboarding_email_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_unsubscribes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`unsubscribed_at` bigint NOT NULL,
	CONSTRAINT `onboarding_unsubscribes_id` PRIMARY KEY(`id`)
);
