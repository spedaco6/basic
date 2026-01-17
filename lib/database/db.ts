import Database from "better-sqlite3";
import "server-only";

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) db = new Database('./lib/database/sqlite.db');
  return db;
}