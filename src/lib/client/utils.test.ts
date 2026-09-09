import { expect, test, describe } from "vitest";
import { checkRequirement } from "./utils";

describe("checkRequirement", () => {
  test.each([
    ["", "", false],
    [" ", "", false],
    [" *", "", true],
    [" * ", "", true],
    ["something", "something", false],
    ["someThing", "someThing", false],
    ["something ", "something", false],
    [" something ", "something", false],
    ["something*", "something", true],
    ["someThing*", "someThing", true],
    ["something* ", "something", true],
    [" something* ", "something", true],
    [" something * ", "something", true],
  ])("'%s' returns ['%s', %s] when no value is provided", (name, returnedName, isRequired) => {
    const result = checkRequirement(name);
    expect(result).toStrictEqual([returnedName, isRequired]);
  });
});