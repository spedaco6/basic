import { describe, test, expect, vi, beforeEach, afterAll } from "vitest";
import { SQLite } from "./SQLite";
import BetterSqlite3 from "better-sqlite3";

// Utility function for normalizing white space
const normalize = (sql) => {
  return sql.replace(/\s+/g, " ").trim();
}

vi.mock("server-only", () => {
  return {};
});

const mockPrepare = vi.fn();
const mockExec = vi.fn();

vi.mock("better-sqlite3", () => {
  return {
    default: class {
      prepare = mockPrepare;
      exec = mockExec;
    }
  }
});

describe("SQLite class", () => {
  beforeEach(() => vi.resetAllMocks());
  test("better-sqlite3 mock works", () => {
    const sqlite3 = new BetterSqlite3("test");
    sqlite3.prepare();
    sqlite3.exec();
    expect(mockExec).toHaveBeenCalledOnce();
    expect(mockPrepare).toHaveBeenCalled();
  });

  test("createTable calls exec with correct syntax", async () => {
    const db = new SQLite("test");
    await db.createTable("test", [{ name: "id", type: "int", primaryKey: true }]);
    const arg =  normalize(mockExec.mock.calls[0][0]);
    expect(arg).toBe("CREATE TABLE IF NOT EXISTS test ( id INTEGER PRIMARY KEY );");
  });
});