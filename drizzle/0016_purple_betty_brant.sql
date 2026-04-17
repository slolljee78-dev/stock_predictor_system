CREATE TABLE `alertPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`minBuyConfidence` int NOT NULL DEFAULT 60,
	`minSellConfidence` int NOT NULL DEFAULT 60,
	`enableBuyAlerts` int NOT NULL DEFAULT 1,
	`enableSellAlerts` int NOT NULL DEFAULT 1,
	`enableSentimentAlerts` int NOT NULL DEFAULT 1,
	`notificationChannels` varchar(100) NOT NULL DEFAULT '["in_app"]',
	`enablePushNotifications` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`url` varchar(2048) NOT NULL,
	`source` varchar(100) NOT NULL,
	`sentimentScore` int NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsArticles_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsArticles_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `signalAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`signalType` enum('buy','sell') NOT NULL,
	`confidence` int NOT NULL,
	`price` int NOT NULL,
	`status` enum('pending','sent','dismissed') NOT NULL DEFAULT 'pending',
	`notificationChannels` varchar(100) NOT NULL,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signalAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockSentiment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`sentimentScore` int NOT NULL,
	`confidence` int NOT NULL,
	`articleCount` int NOT NULL DEFAULT 0,
	`classification` varchar(20) NOT NULL,
	`analysisDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockSentiment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alertPreferences` ADD CONSTRAINT `alertPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertPreferences` ADD CONSTRAINT `alertPreferences_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsArticles` ADD CONSTRAINT `newsArticles_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signalAlerts` ADD CONSTRAINT `signalAlerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signalAlerts` ADD CONSTRAINT `signalAlerts_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stockSentiment` ADD CONSTRAINT `stockSentiment_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;