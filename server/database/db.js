import pkg from 'pg';
const { Client } = pkg;

const database = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ecommerce-store',
  password:'root',
  port: '5432',
})

try {
  database.connect();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection failed", error);
  process.exit(1);
}

export default database;