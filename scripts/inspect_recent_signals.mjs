import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not available');
  process.exit(1);
}

const connection = await mysql.createConnection(databaseUrl);

const [rows] = await connection.execute(`
  SELECT
    s.id,
    st.ticker,
    s.type,
    s.confidenceScore,
    s.status,
    s.priceAtSignal,
    s.createdAt,
    s.analysis
  FROM signals s
  INNER JOIN stocks st ON st.id = s.stockId
  WHERE st.ticker IN ('AAPL','MSFT','NVDA','GOOGL','AMZN','TSLA')
  ORDER BY st.ticker ASC, s.createdAt DESC
  LIMIT 120
`);

const grouped = new Map();
for (const row of rows) {
  if (!grouped.has(row.ticker)) grouped.set(row.ticker, []);
  grouped.get(row.ticker).push(row);
}

for (const [ticker, records] of grouped.entries()) {
  console.log(`\n=== ${ticker} ===`);
  for (const record of records.slice(0, 5)) {
    console.log(`${record.createdAt.toISOString()} | ${record.type} | confidence=${record.confidenceScore} | status=${record.status} | price=${record.priceAtSignal}`);
  }
}

const [summary] = await connection.execute(`
  SELECT st.ticker, s.type, COUNT(*) as count
  FROM signals s
  INNER JOIN stocks st ON st.id = s.stockId
  WHERE st.ticker IN ('AAPL','MSFT','NVDA','GOOGL','AMZN','TSLA')
    AND s.createdAt >= DATE_SUB(NOW(), INTERVAL 3 DAY)
  GROUP BY st.ticker, s.type
  ORDER BY st.ticker ASC, s.type ASC
`);

console.log('\n=== 3-day summary ===');
for (const row of summary) {
  console.log(`${row.ticker} | ${row.type} | ${row.count}`);
}

await connection.end();
