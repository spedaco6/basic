import { expect, test, describe } from "vitest";
import { HTTPError, ValidationError } from "./errors";
import type { ValidationErrors } from "./errors";

describe("HTTPError", () => {
  describe("defaults", () => {
    test("defaults status to 500 when only a message is provided", () => {
      const err = new HTTPError("Something broke");
      expect(err.message).toBe("Something broke");
      expect(err.status).toBe(500);
    });

    test("defaults message to 'HTTP Error' when only a status is provided", () => {
      const err = new HTTPError(404);
      expect(err.message).toBe("HTTP Error");
      expect(err.status).toBe(404);
    });
  });

  describe("argument order", () => {
    test.each([
      ["Not found", 404],
      ["Bad request", 400],
      ["Unauthorized", 401],
    ])("(msg, status) resolves to message '%s' and status %s", (msg, status) => {
      const err = new HTTPError(msg, status);
      expect(err.message).toBe(msg);
      expect(err.status).toBe(status);
    });

    test.each([
      [404, "Not found"],
      [400, "Bad request"],
      [401, "Unauthorized"],
    ])("(status, msg) resolves to message '%s' and status %s", (status, msg) => {
      const err = new HTTPError(status, msg);
      expect(err.message).toBe(msg);
      expect(err.status).toBe(status);
    });
  });

  test("is an instance of Error and HTTPError", () => {
    const err = new HTTPError("Oops", 418);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HTTPError);
  });

  test("status defaults to 500 and is not overwritten by a second string argument", () => {
    // second arg typed as string only pairs with a numeric first arg per overloads,
    // but verifies runtime behavior stays consistent with the type contract
    const err = new HTTPError(500, "Server error");
    expect(err.status).toBe(500);
    expect(err.message).toBe("Server error");
  });
});

describe("ValidationError", () => {
  test("sets status to 422 and a fixed message", () => {
    const errors: ValidationErrors = { email: ["Email is required"] };
    const err = new ValidationError(errors);
    expect(err.status).toBe(422);
    expect(err.message).toBe("Invalid user input");
  });

  test("stores the provided validation errors", () => {
    const errors: ValidationErrors = {
      email: ["Email is required"],
      password: ["Password is too short", "Password must contain a number"],
    };
    const err = new ValidationError(errors);
    expect(err.validation).toStrictEqual(errors);
  });

  test("is an instance of HTTPError and Error", () => {
    const err = new ValidationError({ field: ["invalid"] });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HTTPError);
    expect(err).toBeInstanceOf(ValidationError);
  });
});
