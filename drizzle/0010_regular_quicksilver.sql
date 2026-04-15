ALTER TABLE `users` ADD `emailVerified` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `signalsUsedToday` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `signalsUsedResetAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stocksMonitored` int DEFAULT 0 NOT NULL;