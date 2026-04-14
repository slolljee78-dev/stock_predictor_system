ALTER TABLE `users` ADD `emailVerified` tinyint DEFAULT 0 NOT NULL;
ALTER TABLE `users` ADD `emailVerificationToken` varchar(255);
ALTER TABLE `users` ADD `emailVerificationTokenExpiresAt` timestamp;
