ALTER TABLE `users` ADD `subscriptionTier` varchar(20) DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` varchar(20) DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndedAt` timestamp;