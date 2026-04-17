CREATE TABLE `backtestRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`initialCapital` int NOT NULL,
	`stockIds` text NOT NULL,
	`filterSettings` text,
	`finalCapital` int NOT NULL,
	`totalReturn` int NOT NULL,
	`winRate` int NOT NULL,
	`sharpeRatio` int NOT NULL,
	`maxDrawdown` int NOT NULL,
	`totalTrades` int NOT NULL DEFAULT 0,
	`winningTrades` int NOT NULL DEFAULT 0,
	`avgWin` int NOT NULL DEFAULT 0,
	`avgLoss` int NOT NULL DEFAULT 0,
	`profitFactor` int NOT NULL DEFAULT 0,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `backtestRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backtestTrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backtestRunId` int NOT NULL,
	`stockId` int NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`entryDate` timestamp NOT NULL,
	`entryPrice` int NOT NULL,
	`exitDate` timestamp NOT NULL,
	`exitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`profitLoss` int NOT NULL,
	`returnPercent` int NOT NULL,
	`exitReason` varchar(50) NOT NULL,
	`signalConfidence` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backtestTrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `backtestRuns` ADD CONSTRAINT `backtestRuns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backtestTrades` ADD CONSTRAINT `backtestTrades_backtestRunId_backtestRuns_id_fk` FOREIGN KEY (`backtestRunId`) REFERENCES `backtestRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backtestTrades` ADD CONSTRAINT `backtestTrades_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;