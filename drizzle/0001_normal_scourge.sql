CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`signalId` int NOT NULL,
	`stockId` int NOT NULL,
	`channel` enum('email','inApp','both') NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`signalId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
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
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`confidenceScore` int NOT NULL,
	`priceAtSignal` int NOT NULL,
	`indicators` text,
	`analysis` text,
	`status` enum('active','triggered','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stocks` (
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
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotificationsEnabled` int NOT NULL DEFAULT 1,
	`inAppNotificationsEnabled` int NOT NULL DEFAULT 1,
	`defaultMinConfidence` int NOT NULL DEFAULT 60,
	`alertEmail` varchar(320),
	`preferredChartType` enum('candlestick','line') NOT NULL DEFAULT 'candlestick',
	`theme` enum('light','dark') NOT NULL DEFAULT 'dark',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`label` varchar(100),
	`alertOnBuy` int NOT NULL DEFAULT 1,
	`alertOnSell` int NOT NULL DEFAULT 1,
	`minConfidenceThreshold` int NOT NULL DEFAULT 60,
	`emailNotifications` int NOT NULL DEFAULT 1,
	`inAppNotifications` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watchlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_signalId_signals_id_fk` FOREIGN KEY (`signalId`) REFERENCES `signals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_signalId_signals_id_fk` FOREIGN KEY (`signalId`) REFERENCES `signals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceHistory` ADD CONSTRAINT `priceHistory_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signals` ADD CONSTRAINT `signals_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `watchlists` ADD CONSTRAINT `watchlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `watchlists` ADD CONSTRAINT `watchlists_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;