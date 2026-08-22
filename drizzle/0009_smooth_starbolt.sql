CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`totalReferrals` int NOT NULL DEFAULT 0,
	`totalCreditsEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`status` enum('pending','converted','credited') NOT NULL DEFAULT 'pending',
	`creditsAwarded` int NOT NULL DEFAULT 0,
	`convertedAt` timestamp,
	`creditedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_conversions_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_conversions_referredUserId_unique` UNIQUE(`referredUserId`)
);
--> statement-breakpoint
ALTER TABLE `social_media_analytics` MODIFY COLUMN `engagementRate` decimal(5,2) DEFAULT '0';