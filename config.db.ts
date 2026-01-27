import { ISQLiteConfig } from "./lib/server/database/SQLite";

// SQLite configuration
export const dbConfig: ISQLiteConfig = {
  type: "sqlite",
  path: "./data/sqlite.db",
}


// MySQL configuration
/* export const dbConfig: IMySQLConfig = {
  type: "mysql",
  database: "test",
  user: "user",
  host: "localhost",
  password: "password",
} */