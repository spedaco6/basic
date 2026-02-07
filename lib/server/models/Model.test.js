import { describe, test, expect, vi, beforeEach, afterAll } from "vitest";
import { Model } from "./Model";

vi.mock("server-only", () => ({}));
vi.spyOn(console, "error").mockImplementation(() => {});

class Child extends Model {
  name;
  age;
  isTested;
  
  static tableName = "temp";
  static schema = [
    ...Model.schema,
  ];

  constructor(props) { 
    super(props);
    Object.assign(this, props);
  }
}

describe.only("Model class", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.restoreAllMocks());

  test("success", () => {
    const child = new Child({
      name: "Test Name",
      age: 23,
      isTested: true,
    });
    expect(child instanceof Model).toBe(true);
    expect(child.name).toBe("Test Name");
    expect(child.age).toBe(23);
    expect(child.isTested).toBe(true);
    expect(child.id).not.toBeDefined();
    expect(child.secureKey).not.toBeDefined();
    expect(child.created_at).not.toBeDefined();
    expect(child.updated_at).not.toBeDefined();
  });
});