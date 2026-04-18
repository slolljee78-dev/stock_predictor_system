#!/usr/bin/env node
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the DATABASE_URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
};

const REQUIRED_TABLES = [
  'users',
  'stocks',
  'watchlists',
  'signals',
  'priceHistory',
  'notifications',
  'userPreferences',
  'tradingSimulatorPositions',
  'tradingSimulatorTrades',
  'backtestRuns',
  'backtestTrades',
  'stockSentiment',
  'newsArticles',
  'signalAlerts',
  'alertPreferences',
];

async function verifySchema() {
  let connection;
  try {
    console.log('Connecting to database for schema verification...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database\n');

    // Get all tables in the database
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    );

    const tableNames = tables.map((t) => t.TABLE_NAME);
    console.log(`Found ${tableNames.length} tables in database:\n`);

    // Check for required tables
    const missingTables = [];
    const presentTables = [];

    for (const table of REQUIRED_TABLES) {
      if (tableNames.includes(table)) {
        presentTables.push(table);
        console.log(`✓ ${table}`);
      } else {
        missingTables.push(table);
        console.log(`✗ ${table} (MISSING)`);
      }
    }

    console.log(`\n${presentTables.length}/${REQUIRED_TABLES.length} required tables present`);

    if (missingTables.length > 0) {
      console.log(`\nMissing tables: ${missingTables.join(', ')}`);
      process.exit(1);
    }

    // Verify key columns in critical tables
    console.log('\n--- Verifying Key Columns ---\n');

    const tableColumns = {
      users: ['id', 'openId', 'email', 'name'],
      stocks: ['id', 'ticker', 'name', 'exchange'],
      signals: ['id', 'stockId', 'type', 'confidenceScore'],
      stockSentiment: ['id', 'stockId', 'sentimentScore', 'classification'],
      signalAlerts: ['id', 'userId', 'stockId', 'signalType', 'confidence'],
      alertPreferences: ['id', 'userId', 'stockId', 'minBuyConfidence'],
    };

    for (const [table, columns] of Object.entries(tableColumns)) {
      console.log(`Checking ${table}:`);
      const [tableInfo] = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [config.database, table]
      );

      const columnNames = tableInfo.map((c) => c.COLUMN_NAME);

      for (const col of columns) {
        if (columnNames.includes(col)) {
          console.log(`  ✓ ${col}`);
        } else {
          console.log(`  ✗ ${col} (MISSING)`);
        }
      }
    }

    console.log('\n✓ Schema verification completed successfully!');
  } catch (error) {
    console.error('✗ Schema verification failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifySchema();
