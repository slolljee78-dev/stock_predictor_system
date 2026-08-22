CREATE TABLE `user_alert_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`minBuyConfidence` int NOT NULL DEFAULT 60,
	`minSellConfidence` int NOT NULL DEFAULT 60,
	`enableEmailAlerts` int NOT NULL DEFAULT 0,
	`enablePushAlerts` int NOT NULL DEFAULT 0,
	`enableInAppAlerts` int NOT NULL DEFAULT 1,
	`quietHoursStart` varchar(5) NOT NULL DEFAULT '22:00',
	`quietHoursEnd` varchar(5) NOT NULL DEFAULT '08:00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_alert_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_alert_settings_userId_unique` UNIQUE(`userId`)
);
