# Public API Schema Alignment — 12 August 2026

## Purpose

The live `stocks` and `signals` tables pre-dated the application schema used by the public REST API. This caused public API reads to fail because `stocks.type`, `signals.confidenceScore`, `signals.priceAtSignal`, `signals.analysis`, and `signals.status` were absent.

## Verified precondition

`signals` contained zero rows before the change, so the added current-contract fields required no historical data backfill.

## Applied database change

```sql
ALTER TABLE stocks
  ADD COLUMN type ENUM('equity','etf') NOT NULL DEFAULT 'equity' AFTER exchange;

ALTER TABLE signals
  ADD COLUMN confidenceScore INT NOT NULL DEFAULT 0 AFTER confidence,
  ADD COLUMN priceAtSignal DECIMAL(15,2) NULL AFTER price,
  ADD COLUMN analysis TEXT NULL AFTER reasoning,
  ADD COLUMN status ENUM('active','expired','triggered') NOT NULL DEFAULT 'active' AFTER isActive;
```

## Follow-up

The route no longer fails on missing columns. Public API tests must still receive isolated stock and signal fixtures; they must not seed the shared production database.

## Related reliability progress

The Validation Dashboard activity regression was updated to assert the current **Signal Engine activity** label and passes with TypeScript validation. This change is unrelated to the database alignment but is part of the continuing A5 reliability work.
