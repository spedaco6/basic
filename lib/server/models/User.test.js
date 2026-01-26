import { describe, expect, test, vi } from "vitest";
import { User } from "./User";
import { SQLite } from "../database/SQLite";

vi.mock("server-only", () => ({}));
vi.mock("@/config.db", () => ({
  dbConfig: {
    type: "sqlite",
    path: "./lib/server/database/sqlite_test.db",
  }
}));

const mockCreateTable = vi.fn(async () => Promise.resolve());

vi.mock("@/lib/server/database/SQLite", () => {
  const mockSQLite = vi.fn(() => ({
    SQLite: vi.fn(() => ({ 
      createTable: mockCreateTable,
    })),
  }));
  return { SQLite: mockSQLite };
});

describe("User model", () => {
  test("init", async () => {
    const db = new SQLite("path");
    await User.init(db);
    expect(mockCreateTable).toHaveBeenCalled();
  });
});
