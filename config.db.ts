import { ISQLiteConfig } from "./lib/server/database/SQLite";

// SQLite configuration
export const dbConfig: ISQLiteConfig = {
  type: "sqlite",
  path: process.env.DB_PATH ?? "",
}


// MySQL configuration
/* export const dbConfig: IMySQLConfig = {
  type: "mysql",
  database: "test",
  user: "user",
  host: "localhost",
  password: "password",
} */