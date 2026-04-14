import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function runNewMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  
  // Parse the connection string
  const url = new URL(connectionString);
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port ? parseInt(url.port) : 3306,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const migrationFile = path.join(
      process.cwd(),
      "drizzle/0008_careful_changeling.sql"
    );
    const sql = fs.readFileSync(migrationFile, "utf-8");

    // Split by statement breakpoint and execute each statement
    const statements = sql
      .split("-->")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("statement-breakpoint"));

    console.log(`Running ${statements.length} statements...`);
    
    for (const statement of statements) {
      if (statement) {
        console.log("Executing:", statement.substring(0, 60) + "...");
        await connection.execute(statement);
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runNewMigration();
