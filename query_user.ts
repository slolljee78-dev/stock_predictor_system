import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './drizzle/schema';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(dbUrl);
const db = drizzle(client);

try {
  const allUsers = await db.select().from(users);
  console.log('All users in database:');
  console.log(JSON.stringify(allUsers, null, 2));
  
  if (allUsers.length > 0) {
    console.log('\nFirst user openId:', allUsers[0].openId);
    console.log('First user email:', allUsers[0].email);
  }
} catch (error) {
  console.error('Error querying database:', error);
} finally {
  await client.end();
}
