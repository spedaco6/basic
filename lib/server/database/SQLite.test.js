import { describe, test, expect, vi, beforeEach, afterAll } from "vitest";
import { SQLite } from "./SQLite";
import BetterSqlite3 from "better-sqlite3";

// Utility function for normalizing white space
const normalize = (sql) => {
  return sql.replace(/\s+/g, " ").trim();
}

// Mock modules and functions to avoid error logging
vi.mock("server-only", () => ({}));
vi.spyOn(console, "error").mockImplementation(() => {});

// Create a mock for the better-sqlite3 module
const mockGet = vi.fn();
const mockAll = vi.fn();
const mockRun = vi.fn();
const mockPrepare = vi.fn(() => ({ get: mockGet, all: mockAll, run: mockRun }));
const mockExec = vi.fn();

vi.mock(import("better-sqlite3"), () => {
  return {
    default: class {
      prepare = mockPrepare;
      exec = mockExec;
    }
  }
});

describe("SQLite class", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.restoreAllMocks());
  const db = new SQLite("test");

  test("better-sqlite3 mock works", () => {
    const sqlite3 = new BetterSqlite3("test");
    sqlite3.prepare();
    sqlite3.exec();
    expect(mockExec).toHaveBeenCalledOnce();
    expect(mockPrepare).toHaveBeenCalled();
  });

  describe("createTable", () => {
    test("calls sqlite class with proper argument", async () => {
      await db.createTable("test", [{ name: "id", type: "int", primaryKey: true }]);
      const arg =  normalize(mockExec.mock.calls[0][0]);
      expect(arg).toBe("CREATE TABLE IF NOT EXISTS test ( id INTEGER PRIMARY KEY );");
    });
  
    test.each([
      ["text", "column TEXT"],
      ["string", "column TEXT"],
      ["TEXT", "column TEXT"],
      ["nuMBer" , "column INTEGER"],
      ["int", "column INTEGER"],
      ["Integer", "column INTEGER"],
      ["bool", "column INTEGER NOT NULL CHECK (column IN (0,1))"],
      ["BOOlean", "column INTEGER NOT NULL CHECK (column IN (0,1))"],
    ])("correctly maps %s column schema object to sql statement", async (type, result) => {
      const schema = [{ name: "column", type }]
      await db.createTable("test", schema);
      const arg =  normalize(mockExec.mock.calls[0][0]);
      expect(arg).toContain(result);
    });

    test.each([
      ["primaryKey", { type: "int", primaryKey: true }, "column INTEGER PRIMARY KEY"],
      ["default", { type: "text", default: "test" }, "column TEXT DEFAULT 'test'"],
      ["default", { type: "number", default: 10 }, "column INTEGER DEFAULT 10"],
      ["default", { type: "number", default: 1 }, "column INTEGER DEFAULT 1"],
      ["default", { type: "number", default: 0 }, "column INTEGER DEFAULT 0"],
      ["default", { type: "number", default: -1 }, "column INTEGER DEFAULT -1"],
      ["default", { type: "number", default: -10 }, "column INTEGER DEFAULT -10"],
      ["default", { type: "bool", default: "false" }, "column INTEGER NOT NULL CHECK (column IN (0,1)) DEFAULT 0"],
      ["default", { type: "bool", default: "true" }, "column INTEGER NOT NULL CHECK (column IN (0,1)) DEFAULT 1"],
      ["required", { type: "text", required: true }, "column TEXT NOT NULL"],
      ["unique", { type: "text", unique: true }, "column TEXT UNIQUE"],
    ])("%s is added to sql", async (_, schema, result) => {
      const tableSchema = [{ name: "column", ...schema}];
      await db.createTable("test", tableSchema);
      const arg =  normalize(mockExec.mock.calls[0][0]);
      expect(arg).toContain(result);
    });

    test("timestamp types added to sql properly", async () => {
      const schema = [
        { name: "created_at", type: "timestamp_create" },
        { name: "updated_at", type: "timestamp_update" },
      ]
      await db.createTable("test", schema);
      const tableCall = normalize(mockExec.mock.calls[0][0]);
      expect(tableCall).toContain("created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      expect(tableCall).toContain("updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    });

    test("type: timestamp_update adds update trigger to sql", async () => {
      const schema = [
        { name: "updated_at", type: "timestamp_update" },
      ]
      await db.createTable("test", schema);
      const triggerCall = normalize(mockExec.mock.calls[1][0]);
      const expected = normalize(`CREATE TRIGGER IF NOT EXISTS trigger_on_test_update BEFORE UPDATE ON test
        FOR EACH ROW
        WHEN OLD.updated_at = NEW.updated_at
        BEGIN
          SELECT NEW.updated_at = CURRENT_TIMESTAMP;
        END;`);
      expect(mockExec).toHaveBeenCalledTimes(2);
      expect(triggerCall).toBe(expected);
    });

    test("full implementation example", async () => {
      const tableSchema = [
        { name: "id", type: "int", primaryKey: true },
        { name: "secureKey", type: "text", required: true, unique: true },
        { name: "created_at", type: "timestamp_create" },
        { name: "updated_at", type: "timestamp_update" },
        { name: "name", type: "text", required: true },
        { name: "age", type: "number", default: 23 },
        { name: "ssn", type: "integer", required: true, unique: true },
        { name: "test", type: "int", required: true, default: 23 },
        { name: "test1", type: "bool", default: true },
        { name: "test2", type: "boolean", default: "false" },
        { name: "test3", type: "bool", default: 0 },
      ];
      await db.createTable("testTable", tableSchema);
      const tableCall = normalize(mockExec.mock.calls[0][0]);
      const triggerCall = normalize(mockExec.mock.calls[1][0]);
      const expectedTableCall = normalize(`CREATE TABLE IF NOT EXISTS testTable (
        id INTEGER PRIMARY KEY,
        secureKey TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 23,
        ssn INTEGER NOT NULL UNIQUE,
        test INTEGER NOT NULL DEFAULT 23,
        test1 INTEGER NOT NULL CHECK (test1 IN (0,1)) DEFAULT 1,
        test2 INTEGER NOT NULL CHECK (test2 IN (0,1)) DEFAULT 0,
        test3 INTEGER NOT NULL CHECK (test3 IN (0,1)) DEFAULT 0
      );`);
      const expectedTriggerCall = normalize(`
        CREATE TRIGGER IF NOT EXISTS trigger_on_testTable_update BEFORE UPDATE ON testTable
        FOR EACH ROW
        WHEN OLD.updated_at = NEW.updated_at
        BEGIN
          SELECT NEW.updated_at = CURRENT_TIMESTAMP;
        END;`);
      expect(tableCall).toBe(expectedTableCall);
      expect(triggerCall).toBe(expectedTriggerCall);
    });
  });
  
  describe("deleteTable", () => {
    test("calls sqlite class with correct args", async () => {
      await db.deleteTable("test");
      const call = normalize(mockExec.mock.calls[0][0]);
      expect(call).toBe("DROP TABLE IF EXISTS test;");
    });
  });

  describe("createOne", () => {
    const model = { name: "Test", value: 23 };
    test("calls prepare with proper sql", async () => {
      await db.createOne("testTable", model);
      const prepareCall = normalize(mockPrepare.mock.calls[0][0]);
      const expectedSQL = normalize("INSERT INTO testTable ( name, value ) VALUES (?, ?) RETURNING *;");
      expect(prepareCall).toBe(expectedSQL);
    });
    test("calls get with proper values arr", async () => {
      await db.createOne("testTable", model);
      expect(mockGet).toHaveBeenCalledExactlyOnceWith(["Test", 23]);
    });
  });
  
  describe("find", () => {
    test("prepares sql to query all records in table", async () => {
      await db.find("testTable");
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize("SELECT * FROM testTable ORDER BY id ASC;")
      expect(call).toBe(expected);
      expect(mockPrepare).toHaveBeenCalledOnce();
      expect(mockAll).toHaveBeenCalledOnce();
    });

    test("prepares values array", async () => {
      await db.find("testTable");
      expect(mockAll).toHaveBeenCalledExactlyOnceWith([]);
    });
    
    test("orders by id ASC by default", async () => {
      await db.find("testTable");
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize("SELECT * FROM testTable ORDER BY id ASC;")
      expect(call).toBe(expected);
    });

    test.each([
      [{ name: "test" }, "name = ?"],
      [{ name: "test", age: 23 }, "name = ? AND age = ?"],
      [{ name: "test", age: 23, test: true }, "name = ? AND age = ? AND test = ?"],
    ])("accepts object of search conditions", async (cond, result) => {
      await db.find("testTable", cond);
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable WHERE (${result}) ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });

    test.each([
      [{ name: "test" }, ["test"]],
      [{ name: "test", age: 23 }, ["test", 23]],
      [{ name: "test", age: 23, test: true }, ["test", 23, 1]],
      [{ name: "test", age: 23, test: false }, ["test", 23, 0]],
    ])("creates values array for interpolation", async (cond, result) => {
      await db.find("testTable", cond);
      expect(mockAll).toHaveBeenCalledExactlyOnceWith(result);
    });

    test.each([
      [{ test: true }, [1]],
      [{ test: false }, [0]],
    ])("successfully converts bool values to numeric 0 or 1", async (cond, result) => {
      await db.find("testTable", cond);
      const call = mockAll.mock.calls[0][0];
      expect(call).toStrictEqual(result);
    });

    test("handles multiple search parameters as AND conditions by default", async () => {
      await db.find("testTable", { name: "test", age: 23, test: true });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable 
        WHERE (name = ? AND age = ? AND test = ?) 
        ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });

    test("correctly handles 'and' conditions", async () => {
      await db.find("testTable", { and: { name: "test", age: 23, test: true } });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable 
        WHERE ((name = ? AND age = ? AND test = ?)) 
        ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });
    
    test("correctly handles 'or' conditions", async () => {
      await db.find("testTable", { or: { name: "test", age: 23, test: true } });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable 
        WHERE ((name = ? OR age = ? OR test = ?)) 
        ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });
    
    test.each([
      [{ name: "test", or: { age: 23, test: true }}, "(name = ? AND (age = ? OR test = ?))"],
      [{ and: { name: "test", or: { age: 23, test: true } } }, "((name = ? AND (age = ? OR test = ?)))"],
      [{ or: { name: "test", and: { age: 23, test: true } } }, "((name = ? OR (age = ? AND test = ?)))"],
      [{ or: { name: "test", and: { age: 23, and: { test: true, test2: true, or: { test3: 1, test4: 2 } } }}}, 
        "((name = ? OR (age = ? AND (test = ? AND test2 = ? AND (test3 = ? OR test4 = ?)))))"
      ],
    ])("correctly handles nested and/or statements recursively", async (cond, result) => {
      await db.find("testTable", cond);
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable 
        WHERE ${result} 
        ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });

    test.each([
      [{ name: "test", or: { age: 23, test: true }}, ["test", 23, 1]],
      [{ and: { name: "test", or: { age: 23, test: true } } }, ["test", 23, 1]],
      [{ or: { name: "test", and: { age: 23, test: true } } }, ["test", 23, 1]],
      [{ or: { name: "test", and: { age: 23, and: { test: true, test2: false, or: { test3: 1, test4: 2 } } }}}, 
        ["test", 23, 1, 0, 1, 2]
      ],
    ])("correctly creates values array for nested and/or statements", async (cond, result) => {
      await db.find("testTable", cond);
      expect(mockAll).toHaveBeenCalledExactlyOnceWith(result);
    });

    test.each([
      [{ test: [1, 2, 3]}, "(test IN (?, ?, ?))"],
      [{ test: [1, 2, 3], test2: "test" }, "(test IN (?, ?, ?) AND test2 = ?)"],
    ])("allows for multiple values in an array", async (cond, result) => {
      await db.find("testTable", cond);
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`SELECT * FROM testTable 
        WHERE ${result} 
        ORDER BY id ASC;`)
      expect(call).toBe(expected);
    });

    test.each([
      [{ test: [1, 2, 3]}, [1, 2, 3]],
      [{ test: [1, 2, 3], test2: "test" }, [1, 2, 3, "test"]],
    ])("create values array for multiple values", async (cond, result) => {
      await db.find("testTable", cond);
      expect(mockAll).toHaveBeenCalledExactlyOnceWith(result);
    });

    test("order by sets ORDER BY column", async () => {
      await db.find("testTable", {}, { order: "test" });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`
        SELECT * FROM testTable ORDER BY test ASC;
      `);
      expect(call).toBe(expected);
    });

    test.each([
      ["asc", "ASC"],
      ["desc", "DESC"],
    ])("sort sets SORT order", async (sort, result) => {
      await db.find("testTable", {}, { sort });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`
        SELECT * FROM testTable ORDER BY id ${result};
      `);
      expect(call).toBe(expected);
    });
    
    test("limit sets number of items returned", async () => {
      await db.find("testTable", {}, { limit: 2 });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`
        SELECT * FROM testTable ORDER BY id ASC LIMIT ?;
      `);
      expect(call).toBe(expected);
    });

    test("limit adds number to values array", async () => {
      await db.find("testTable", {name: "test", value: 4}, { limit: 2 });
      expect(mockAll).toHaveBeenCalledExactlyOnceWith(["test", 4, 2]);
    });

    test("skip sets number of items returned", async () => {
      await db.find("testTable", {}, { limit: 2, skip: 5 });
      const call = normalize(mockPrepare.mock.calls[0][0]);
      const expected = normalize(`
        SELECT * FROM testTable ORDER BY id ASC LIMIT ? OFFSET ?;
      `);
      expect(call).toBe(expected);
    });

    test("skip adds number to be skipped to values array", async () => {
      await db.find("testTable", {name: "test", value: 4}, { limit: 2, skip: 5 });
      expect(mockAll).toHaveBeenCalledExactlyOnceWith(["test", 4, 2, 5]);
    });
  });

  describe("deleteOne", () => {
    test("calls proper sql and values to delete one record", async () => {
      mockRun.mockResolvedValueOnce({ changes: 1 });
      const success = await db.deleteOne("testTable", { id: 23 });
      const call = normalize(mockPrepare.mock.calls[1][0]);
      const expected = normalize("DELETE FROM testTable WHERE id = ?;");
      expect(mockPrepare).toHaveBeenCalledTimes(2);
      expect(call).toBe(expected);
      expect(mockRun).toHaveBeenCalledExactlyOnceWith(23);
      expect(success).toBe(true);
    });

    test("returns false when no id is provided in object", async () => {
      const result = await db.deleteOne("testTable", {});
      expect(result).toBe(false);
    });

    test("returns false when no user is found", async () => {
      mockGet.mockResolvedValueOnce(null);
      const result = await db.deleteOne("testTable", {id: 23});
      expect(result).toBe(false);
    });
  });
  
  describe("updateOne", () => {
    test("returns false when no id is provided in object", async () => {
      const result = await db.updateOne("testTable", {});
      expect(result).toBe(null);
    });

    test("returns false when no user is found", async () => {
      mockGet.mockResolvedValueOnce(null);
      const result = await db.updateOne("testTable", {});
      expect(result).toBe(null);
    });

    test("prepares proper sql for updating", async () => {
      await db.updateOne("testTable", { id: 23, name: "test", age: 34 });
      const call = normalize(mockPrepare.mock.calls[1][0]);
      const expected = normalize(`
        UPDATE testTable
        SET name = ?, age = ?
        WHERE id = ?
        RETURNING *;
      `);
      expect(mockPrepare).toHaveBeenCalledTimes(2);
      expect(call).toBe(expected);
    });

    test("prepares proper values array for updating", async () => {
      await db.updateOne("testTable", { id: 23, name: "test", age: 34 });
      expect(mockGet).toHaveBeenCalledExactlyOnceWith(["test", 34, 23]);
    });

    test("does not allow id or secureKey to be changed", async () => {
      await db.updateOne("testTable", { id: 23, secureKey: "uneditable", name: "test", age: 34 });
      const call = normalize(mockPrepare.mock.calls[1][0]);
      const expected = normalize(`
        UPDATE testTable
        SET name = ?, age = ?
        WHERE id = ?
        RETURNING *;
      `);
      expect(mockPrepare).toHaveBeenCalledTimes(2);
      expect(call).toBe(expected);
    });
  });
});