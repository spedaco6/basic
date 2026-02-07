import { SQLite } from "./SQLite";
import { Database } from "./Database";
import { dbConfig } from "../../../config.db";
import "server-only";

let db: Database;

export function getDb(): Database {
  if (dbConfig.type === "sqlite") {
    if (!db) db = new SQLite(dbConfig.path);
    return db;
  }
  return new SQLite(dbConfig.path);
}