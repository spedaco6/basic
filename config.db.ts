import { ISQLiteConfig } from "./lib/database/SQLite";

// SQLite configuration
export const dbConfig: ISQLiteConfig = {
  type: "sqlite",
  path: "./lib/database/sqlite.db",
}


// MySQL configuration
/* export const dbConfig: IMySQLConfig = {
  type: "mysql",
  database: "test",
  user: "user",
  host: "localhost",
  password: "password",
} */