ALTER TABLE `backtest_runs` ADD `totalTrades` int;--> statement-breakpoint
ALTER TABLE `backtest_runs` ADD `winningTrades` int;--> statement-breakpoint
ALTER TABLE `backtest_runs` ADD `avgWin` decimal(15,2);--> statement-breakpoint
ALTER TABLE `backtest_runs` ADD `avgLoss` decimal(15,2);--> statement-breakpoint
ALTER TABLE `backtest_runs` ADD `profitFactor` decimal(10,4);