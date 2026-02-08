import { describe, test, expect, beforeEach, beforeAll, vi, afterAll } from "vitest";

let mockDb;
let Model;
let TestModel;

vi.mock("server-only", () => ({}));
vi.mock("../database/db", () => ({
  getDb: () => mockDb,
}));

beforeAll(async () => {
  ({ Model } = await import("./Model"));

  TestModel = class TestModel extends Model {
    static tableName = "test_models";
    static schema = [
      { name: "name", type: "text", required: true },
    ];
    name;

    constructor(data = {}) {
      super();
      Object.assign(this, data);
    }
  };
});

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe("Model base class", () => {
  beforeEach(() => {
    mockDb = {
      find: vi.fn(),
      createOne: vi.fn(),
      updateOne: vi.fn(),
      deleteOne: vi.fn(),
      createTable: vi.fn(),
      deleteTable: vi.fn(),
    };

    TestModel.db = mockDb;
    vi.clearAllMocks();
  });
  afterAll(() => vi.restoreAllMocks());

  test("init() creates table", async () => {
    await TestModel.init(mockDb);
    expect(mockDb.createTable).toHaveBeenCalledWith(
      "test_models",
      TestModel.schema
    );
  });

  test("find() returns records", async () => {
    mockDb.find.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
    const result = await TestModel.find({ name: "Test" });
    expect(result).toEqual([{ id: 1, name: "Test" }]);
  });

  test("findById() returns model instance", async () => {
    mockDb.find.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
    const model = await TestModel.findById(1);
    expect(model).toBeInstanceOf(TestModel);
    expect(model.id).toBe(1);
  });

  describe("save()", () => {
    test("creates new record when id is undefined", async () => {
      mockDb.createOne.mockImplementationOnce((_, data) => ({
        ...data,
        id: 1,
        created_at: "12-12-12 12:12:12",
        updated_at: "12-12-12 12:12:13",
      }));
      const model = new TestModel({ name: "New" });
      await model.save();
      expect(model.id).toBe(1);
      expect(model.secureKey).toBeDefined();
      expect(model.created_at).toBe("12-12-12 12:12:12");
      expect(model.updated_at).toBe("12-12-12 12:12:13");
    });
  
    test("automatically generates a secureKey if none exist", async () => {
      mockDb.createOne.mockImplementationOnce((_, data) => ({
        ...data,
        id: 1,
        created_at: "12-12-12 12:12:12",
        updated_at: "12-12-12 12:12:13",
      }));
      const model = new TestModel({ name: "New" });
      await model.save();
      expect(model.secureKey).toBeDefined();
    });

    test("will not change secureKey if it already exists", async () => {
      mockDb.createOne.mockImplementationOnce((_, data) => ({
        ...data,
        id: 1,
        secureKey: "alreadySet",
        created_at: "12-12-12 12:12:12",
        updated_at: "12-12-12 12:12:13",
      }));
      const model = new TestModel({ name: "New" });
      await model.save();
      expect(model.secureKey).toBe("alreadySet");
    });
  
    test("updates exsiting record when id is defined", async () => {
      mockDb.updateOne.mockImplementationOnce((_, data) => ({
        ...data,
        id: 1,
        created_at: "12-12-12 12:12:12",
        updated_at: "12-12-12 12:12:13",
      }));
      const model = new TestModel({ id: 23, secureKey: "secure23", name: "New" });
      await model.save();
      expect(mockDb.updateOne).toHaveBeenCalledOnce();
    });
  });

  test("delete() removes record", async () => {
    const model = new TestModel({ id: 1 });
    await model.delete();
    expect(mockDb.deleteOne).toHaveBeenCalled();
    expect(mockDb.deleteOne).toHaveBeenCalledWith("test_models", expect.objectContaining({ id: 1 }));
  });
});
