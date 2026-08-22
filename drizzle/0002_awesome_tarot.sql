CREATE TABLE `alert_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`minBuyConfidence` int DEFAULT 60,
	`minSellConfidence` int DEFAULT 60,
	`enableBuyAlerts` int DEFAULT 1,
	`enableSellAlerts` int DEFAULT 1,
	`enableSentimentAlerts` int DEFAULT 0,
	`notificationChannels` json,
	`enablePushNotifications` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backtest_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`initialCapital` decimal(15,2) NOT NULL,
	`finalCapital` decimal(15,2),
	`totalReturn` decimal(10,4),
	`winRate` decimal(10,4),
	`sharpeRatio` decimal(10,4),
	`maxDrawdown` decimal(10,4),
	`stockIds` json,
	`filterSettings` json,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backtest_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backtest_trades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backtestRunId` int NOT NULL,
	`stockId` int NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`entryDate` timestamp NOT NULL,
	`entryPrice` decimal(15,2) NOT NULL,
	`exitDate` timestamp,
	`exitPrice` decimal(15,2),
	`quantity` int NOT NULL,
	`profitLoss` decimal(15,2),
	`returnPercent` decimal(10,4),
	`exitReason` varchar(50),
	`signalConfidence` int,
	CONSTRAINT `backtest_trades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`content` text,
	`url` varchar(1000),
	`source` varchar(100),
	`sentimentScore` int,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_articles_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`signalId` int,
	`ticker` varchar(10),
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`priceAlertId` int NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`triggerPrice` decimal(15,2) NOT NULL,
	`targetPrice` decimal(15,2) NOT NULL,
	`alertType` varchar(30) NOT NULL,
	`notificationChannels` json,
	`notificationSent` int DEFAULT 0,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_alert_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`targetPrice` decimal(15,2) NOT NULL,
	`alertType` enum('above','below','percent_change') NOT NULL,
	`status` enum('active','triggered','cancelled') NOT NULL DEFAULT 'active',
	`enableBrowserNotification` int DEFAULT 1,
	`enableEmailNotification` int DEFAULT 0,
	`triggerCount` int DEFAULT 0,
	`lastTriggeredPrice` decimal(15,2),
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`date` timestamp NOT NULL,
	`open` int NOT NULL,
	`high` int NOT NULL,
	`low` int NOT NULL,
	`close` int NOT NULL,
	`volume` int NOT NULL,
	`adjClose` int,
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`signalType` enum('buy','sell','hold') NOT NULL,
	`confidence` int NOT NULL,
	`price` decimal(15,2),
	`status` enum('pending','sent','dismissed') NOT NULL DEFAULT 'pending',
	`notificationChannels` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`type` enum('buy','sell','hold') NOT NULL,
	`confidenceScore` int NOT NULL,
	`priceAtSignal` decimal(15,2),
	`indicators` json,
	`analysis` text,
	`status` enum('active','expired','triggered') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_sentiment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockId` int NOT NULL,
	`sentimentScore` int NOT NULL,
	`confidence` int NOT NULL,
	`articleCount` int NOT NULL,
	`classification` enum('very_positive','positive','neutral','negative','very_negative') NOT NULL,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_sentiment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`type` enum('equity','etf') NOT NULL DEFAULT 'equity',
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`sector` varchar(100),
	`industry` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `stocks_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredExchanges` json,
	`preferredSectors` json,
	`riskTolerance` enum('low','medium','high') DEFAULT 'medium',
	`defaultTimeframe` varchar(20) DEFAULT '1y',
	`autoRefresh` int DEFAULT 1,
	`showTechnicalIndicators` int DEFAULT 1,
	`showSentiment` int DEFAULT 1,
	`notificationFrequency` enum('realtime','daily','weekly') DEFAULT 'realtime',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `watchlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`label` varchar(100),
	`alertOnBuy` int NOT NULL DEFAULT 1,
	`alertOnSell` int NOT NULL DEFAULT 1,
	`minConfidenceThreshold` int DEFAULT 60,
	`emailNotifications` int DEFAULT 0,
	`inAppNotifications` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','pro','premium') DEFAULT 'free';