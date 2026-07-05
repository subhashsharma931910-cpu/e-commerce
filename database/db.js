import { config } from "dotenv";
import pkg from "pg";
const { Client } = pkg;

config()

const database = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  database.connect();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection failed", error);
  process.exit(1);
}

export default database;
