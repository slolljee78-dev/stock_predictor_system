ALTER TABLE `users` DROP COLUMN `emailVerified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationToken`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationExpiresAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `signalsUsedToday`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `signalsUsedResetAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `stocksMonitored`;