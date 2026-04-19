CREATE TABLE `priceAlertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`priceAlertId` int NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`triggerPrice` varchar(20) NOT NULL,
	`targetPrice` varchar(20) NOT NULL,
	`alertType` enum('above','below') NOT NULL,
	`notificationChannels` varchar(100) NOT NULL,
	`notificationSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceAlertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`targetPrice` varchar(20) NOT NULL,
	`alertType` enum('above','below') NOT NULL,
	`status` enum('active','triggered','dismissed','deleted') NOT NULL DEFAULT 'active',
	`enableBrowserNotification` int NOT NULL DEFAULT 1,
	`enableEmailNotification` int NOT NULL DEFAULT 0,
	`triggerCount` int NOT NULL DEFAULT 0,
	`lastTriggeredPrice` varchar(20),
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `priceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `priceAlertHistory` ADD CONSTRAINT `priceAlertHistory_priceAlertId_priceAlerts_id_fk` FOREIGN KEY (`priceAlertId`) REFERENCES `priceAlerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceAlertHistory` ADD CONSTRAINT `priceAlertHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceAlertHistory` ADD CONSTRAINT `priceAlertHistory_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceAlerts` ADD CONSTRAINT `priceAlerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceAlerts` ADD CONSTRAINT `priceAlerts_stockId_stocks_id_fk` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE cascade ON UPDATE no action;