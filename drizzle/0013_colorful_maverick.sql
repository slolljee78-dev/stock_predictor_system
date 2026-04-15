DROP TABLE `brokerAccounts`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
DROP TABLE `notificationPreferences`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
DROP TABLE `portfolioTemplates`;--> statement-breakpoint
DROP TABLE `watchlistGroups`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `trialStartedAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `trialExpiresAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `watchlistCount`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `riskStrategy`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationToken`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationTokenExpiresAt`;--> statement-breakpoint
ALTER TABLE `watchlists` DROP COLUMN `displayOrder`;