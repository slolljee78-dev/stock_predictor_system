ALTER TABLE `price_alerts` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `signal_alerts` ADD `sentAt` timestamp;