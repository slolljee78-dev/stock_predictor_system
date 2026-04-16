CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`startingCapital` int NOT NULL,
	`currentCapital` int NOT NULL,
	`totalReturn` int NOT NULL DEFAULT 0,
	`winRate` int NOT NULL DEFAULT 0,
	`sharpeRatio` int NOT NULL DEFAULT 0,
	`maxDrawdown` int NOT NULL DEFAULT 0,
	`totalTrades` int NOT NULL DEFAULT 0,
	`winningTrades` int NOT NULL DEFAULT 0,
	`profitFactor` int NOT NULL DEFAULT 0,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;