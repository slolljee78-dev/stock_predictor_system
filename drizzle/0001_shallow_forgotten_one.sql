CREATE TABLE `backtests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`strategy` varchar(50) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`initialCapital` decimal(15,2) NOT NULL,
	`finalValue` decimal(15,2),
	`totalReturn` decimal(10,2),
	`sharpeRatio` decimal(10,4),
	`maxDrawdown` decimal(10,2),
	`winRate` decimal(10,2),
	`totalTrades` int,
	`dividendIncome` decimal(15,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backtests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dividends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`exDate` timestamp NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`dividendPerShare` decimal(10,4) NOT NULL,
	CONSTRAINT `dividends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`eventType` enum('earnings','news','dividend','split') NOT NULL,
	`eventDate` timestamp NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`impact` enum('low','medium','high') DEFAULT 'medium',
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intraday_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`open` decimal(15,2) NOT NULL,
	`high` decimal(15,2) NOT NULL,
	`low` decimal(15,2) NOT NULL,
	`close` decimal(15,2) NOT NULL,
	`volume` int NOT NULL,
	CONSTRAINT `intraday_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`status` enum('pending','executed','cancelled') NOT NULL DEFAULT 'pending',
	`orderType` enum('market','limit','stop') NOT NULL DEFAULT 'market',
	`stopPrice` decimal(15,2),
	`executedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cashBalance` decimal(15,2) NOT NULL DEFAULT '10000',
	`totalValue` decimal(15,2) NOT NULL DEFAULT '10000',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`shares` decimal(18,8) NOT NULL,
	`averageCost` decimal(15,2) NOT NULL,
	`currentPrice` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technical_indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`sma20` decimal(15,2),
	`sma50` decimal(15,2),
	`ema12` decimal(15,2),
	`ema26` decimal(15,2),
	`rsi14` decimal(10,2),
	CONSTRAINT `technical_indicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trade_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`signalType` enum('buy','sell','hold') NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`reasoning` text,
	`technicalFactors` json,
	`suppressedByEvent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trade_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`commission` decimal(10,2) DEFAULT '0',
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_items_id` PRIMARY KEY(`id`)
);
