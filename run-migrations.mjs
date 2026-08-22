#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the DATABASE_URL
// Format: mysql://user:password@host:port/database
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
};

async function runMigrations() {
  let connection;
  try {
    console.log('Connecting to database with SSL...');
    console.log(`Host: ${config.host}:${config.port}`);
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Get all SQL files sorted by name
    const migrationsDir = path.join(process.cwd(), 'drizzle');
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`\nFound ${sqlFiles.length} migration files`);

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      // Split by statement breakpoint
      const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
      
      console.log(`\nExecuting ${file}...`);
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt) {
          try {
            await connection.execute(stmt);
            console.log(`  ✓ Statement ${i + 1}/${statements.length}`);
          } catch (error) {
            // Ignore "already exists" errors
            if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists') || error.message.includes('Duplicate')) {
              console.log(`  ⊘ Statement ${i + 1}/${statements.length} (already exists, skipping)`);
            } else {
              console.error(`  ✗ Error in statement ${i + 1}:`, error.message);
              throw error;
            }
          }
        }
      }
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
