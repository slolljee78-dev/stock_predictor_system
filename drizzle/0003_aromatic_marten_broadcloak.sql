ALTER TABLE `users` MODIFY COLUMN `subscriptionTier` enum('free','STARTER','PRO','ELITE') DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStartedAt` timestamp;