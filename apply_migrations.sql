-- Migration 0000: Initial schema
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`subscriptionTier` varchar(20) DEFAULT 'free',
	`subscriptionStatus` varchar(20) DEFAULT 'inactive',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionStartedAt` timestamp,
	`subscriptionEndedAt` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

-- Migration 0003: Add trial fields
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `trialStartedAt` timestamp;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `watchlistCount` int DEFAULT 0;

-- Migration 0006: Add trialExpiresAt
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `trialExpiresAt` timestamp;

-- Migration 0008: Add riskStrategy
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `riskStrategy` enum('cautious','balanced','high_risk') DEFAULT 'balanced' NOT NULL;

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS `stocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`name` text NOT NULL,
	`isin` varchar(12),
	`cusip` varchar(9),
	`type` enum('equity','etf') NOT NULL,
	`exchange` varchar(20) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`marketCap` int,
	`sector` varchar(50),
	`industry` varchar(50),
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `stocks_ticker_unique` UNIQUE(`ticker`),
	CONSTRAINT `stocks_isin_unique` UNIQUE(`isin`),
	CONSTRAINT `stocks_cusip_unique` UNIQUE(`cusip`)
);

CREATE TABLE IF NOT EXISTS `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`date` timestamp NOT NULL,
	`open` int NOT NULL,
	`high` int NOT NULL,
	`low` int NOT NULL,
	`close` int NOT NULL,
	`volume` int NOT NULL,
	`adjClose` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `priceHistory_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`signalType` enum('buy','sell') NOT NULL,
	`confidence` int NOT NULL,
	`modelType` enum('lstm','xgboost','ensemble') NOT NULL,
	`technicalIndicators` text,
	`priceTarget` int,
	`stopLoss` int,
	`riskRewardRatio` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`status` enum('active','closed','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signals_id` PRIMARY KEY(`id`),
	CONSTRAINT `signals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `signals_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS `watchlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watchlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `watchlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS `watchlistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`watchlistId` int NOT NULL,
	`stockId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlistItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `watchlistItems_watchlistId_watchlists_id_fk` FOREIGN KEY (`watchlistId`) REFERENCES `watchlists`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `watchlistItems_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS `backtestResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`modelType` enum('lstm','xgboost','ensemble') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`winRate` int NOT NULL,
	`totalTrades` int NOT NULL,
	`profitLoss` int NOT NULL,
	`maxDrawdown` int NOT NULL,
	`sharpeRatio` int,
	`parameters` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backtestResults_id` PRIMARY KEY(`id`),
	CONSTRAINT `backtestResults_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `backtestResults_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`alertType` enum('price','signal','milestone') NOT NULL,
	`threshold` int,
	`isActive` int NOT NULL DEFAULT 1,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `alerts_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action
);
