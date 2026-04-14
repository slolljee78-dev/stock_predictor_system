import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
const url = new URL(dbUrl);

const connection = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
});

const migrations = [
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `emailVerified` tinyint DEFAULT 0 NOT NULL;',
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `emailVerificationToken` varchar(255);',
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `emailVerificationExpiresAt` timestamp;',
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `signalsUsedToday` int DEFAULT 0 NOT NULL;',
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `signalsUsedResetAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;',
  'ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `stocksMonitored` int DEFAULT 0 NOT NULL;',
];

for (const migration of migrations) {
  try {
    await connection.execute(migration);
    console.log('✓', migration.substring(0, 60) + '...');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⊘ Column already exists, skipping');
    } else {
      console.error('✗ Error:', error.message);
    }
  }
}

await connection.end();
console.log('Migration completed!');
