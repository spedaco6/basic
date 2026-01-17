import { SQLite } from "./SQLite";
import "server-only";

let db: SQLite;

export function getDb(): SQLite {
  if (!db) db = new SQLite('./lib/database/sqlite.db');
  return db;
}