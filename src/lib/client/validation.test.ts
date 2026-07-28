import { expect, test, describe } from "vitest";
import { Validator } from "./validation";

describe("Validator", () => {
  describe("EMAIL", () => {
    test("accepts validator", () => {
      const v = new Validator("email@email.com");
      const result = Validator.EMAIL(v);
      expect(result).not.toBeDefined();
      expect(v.getErrors()).toBeNull();
      
      v.value = "email";
      const result2 = Validator.EMAIL(v);
      expect(result2).not.toBeDefined();
      const errors = v.getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
    });
    test("accepts string", () => {
      const error = Validator.EMAIL("email@email.com");
      expect(error).toBeNull();
      
      const error2 = Validator.EMAIL("emailemail.com");
      expect(error2).toBeTypeOf("string");
    });

    test.each([
      ["email@email.com", true],
      ["email@emailcom", false],
      ["emailemail.com", false],
      ["email@email.c", false],
      ["ema_%+-il@em.-ail.com", true],
      ["email@email.com", true],
      ["ema&il@email.com", false],
      ["email@em%ail.com", false],
      ["", true],
    ])("checks for valid email address (%s)", (val, result) => {
      const v = new Validator(val);
      Validator.EMAIL(v);
      const errors = v.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);
      }
    });
    test("returns customized message when name is provided", () => {
      const valid = new Validator("invalid", "name");
      Validator.EMAIL(valid);
      expect(valid.getErrors()).toStrictEqual(["Name is an invalid email address"]);
    });
  });

  describe("REQUIRE", () => {
    test("hides required msg when other validators exist", () => {
      const valid = new Validator("");
      Validator.EMAIL(valid);
      Validator.REQUIRE(valid);
      const errors = valid.getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toStrictEqual(["Email address is invalid"]);
    });
    test("accepts validator", () => {
      const v = new Validator(true);
      const result = Validator.REQUIRE(v);
      expect(result).not.toBeDefined();
      expect(v.getErrors()).toBeNull();
      
      v.value = 0;
      const result2 = Validator.REQUIRE(v);
      expect(result2).not.toBeDefined();
      const errors = v.getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
    });
    test("accepts other data types", () => {
      const error = Validator.REQUIRE("value");
      expect(error).toBeNull();
      
      const error2 = Validator.REQUIRE("");
      expect(error2).toBeTypeOf("string");
    });
    test.each([
      ["string", "sample", true],
      ["string", "", false],
      ["number", 1, true],
      ["number", 0, false],
      ["boolean", true, true],
      ["boolean", false, false],
      ["object", ["test"], true],
      ["object", [], true],
      ["object", { foo: "bar" }, true],
      ["object", {}, true],
      ["undefined", undefined, false],
      ["null", null, false],
    ])("requires %s value", (_, val, result) => {
      const valid = new Validator(val);
      Validator.REQUIRE(valid);
      const errors = valid.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);
      }
      expect(valid.errors).toHaveLength(0);
    });

    test("returns customized message when name is provided", () => {
      const valid = new Validator("", "name");
      Validator.REQUIRE(valid);
      const errors = valid.getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toStrictEqual(["Name is required"]);
    });

    test("instance returns this", () => {
      const valid = new Validator("");
      let errors = valid.require().getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
      valid.value = "this";
      errors = valid.require().getErrors();
      expect(errors).toBeNull();
    });
  });

  describe("EQUALS", () => {
    test("returns a ValidatorFn when passed a value", () => {
      const equals = Validator.EQUALS("toEqual");
      expect(equals).toBeTypeOf("function");
    });

    test.each([
      [2, 2],
      [4, 2],
      ["two", "two"],
      ["four", "two"],
      [true, true],
      [true, false],
    ])("returned ValidatorFn checks correctly checks minimums (%s)", (val1, val2) => {
      const isEqual = val1 === val2;
      const equals = Validator.EQUALS(val1);
      const valid = new Validator(val2);
      equals(valid);
      let errors = valid.getErrors();
      if (isEqual) expect(errors).toBeNull();
      if (!isEqual) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });

    test.each([
      [2, 2],
      [4, 2],
      ["two", "two"],
      ["four", "two"],
      [true, true],
      [true, false],
    ])("no return when passed a Validator object (%s)", (val1, val2) => {
      const isEqual = val1 === val2;
      const valid = new Validator(val2);
      Validator.EQUALS(val1, valid);
 
      let errors = valid.getErrors();
      if (isEqual) expect(errors).toBeNull();
      if (!isEqual) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });

    test.each([
      [2, 2],
      [4, 2],
      ["two", "two"],
      ["four", "two"],
      [true, true],
      [true, false],
    ])("returns an error when passed two values (%s)", (val1, val2) => {
      const isEqual = val1 === val2;
      const equals = Validator.EQUALS(val1, val2);
      if (isEqual) expect(equals).toBeNull();
      if (!isEqual) expect(equals).toBeTypeOf("string");
    });
    test("instance returns this", () => {
      const valid = new Validator("this");
      let errors = valid.equals("that").getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
      valid.value = "this";
      errors = valid.equals("this").getErrors();
      expect(errors).toBeNull();
    });
  }); 

  describe("MIN", () => {
    test("returns a ValidatorFn when passed a number", () => {
      const min8 = Validator.MIN(4);
      expect(min8).toBeTypeOf("function");
    });
    test.each([
      [2, false],
      [4, true],
      ["", false],
      ["two", false],
      ["four", true],
      [[1,2], false],
      [[1,2,3,4], true],
      [{ foo: "bar" }, false],
      [undefined, false],
      [null, false],
      [true, false],
      [false, false],
    ])("returned ValidatorFn checks correctly checks minimums (%s)", (val, result) => {
      const min4 = Validator.MIN(4);
      const valid = new Validator(val);
      min4(valid);
      let errors = valid.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });
    test.each([
      [2, false],
      [4, true],
      ["two", false],
      ["four", true],
      [[1,2], false],
      [[1,2,3,4], true],
      [{ foo: "bar" }, false],
      [null, false],
      [true, false],
      [false, false],
    ])("returns an error when passed a number and value (%s)", (val, result) => {
      const valid = Validator.MIN(4, val);
      if (result) expect(valid).toBeNull();
      if (!result) expect(valid).toBeTypeOf("string");
    });
    test.each([
      [2, false],
      [4, true],
      ["two", false],
      ["four", true],
      [[1,2], false],
      [[1,2,3,4], true],
      [{ foo: "bar" }, false],
      [null, false],
      [true, false],
      [false, false],
    ])("no return when passed a Validator object (%s)", (val, result) => {
      const valid = new Validator(val);
      Validator.MIN(4, valid);
      const errors = valid.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });
    test("instance returns this", () => {
      const valid = new Validator("");
      let errors = valid.min(4).getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
      valid.value = "this";
      errors = valid.min(4).getErrors();
      expect(errors).toBeNull();
    });
  }); 
  describe("MAX", () => {
    test("returns a ValidatorFn when passed a number", () => {
      const min8 = Validator.MIN(4);
      expect(min8).toBeTypeOf("function");
    });
    test.each([
      [2, true],
      [4, false],
      ["to", true],
      ["four", false],
      [[1,2], true],
      [[1,2,3,4], false],
      [{ foo: "bar" }, false],
      [undefined, false],
      [null, false],
      [true, false],
      [false, false],
    ])("returned ValidatorFn checks correctly checks minimums (%s)", (val, result) => {
      const max2 = Validator.MAX(2);
      const valid = new Validator(val);
      max2(valid);
      let errors = valid.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });
    test.each([
      [2, true],
      [4, false],
      ["to", true],
      ["four", false],
      [[1,2], true],
      [[1,2,3,4], false],
      [{ foo: "bar" }, false],
      [null, false],
      [true, false],
      [false, false],
    ])("returns an error when passed a number and value (%s)", (val, result) => {
      const valid = Validator.MAX(2, val);
      if (result) expect(valid).toBeNull();
      if (!result) expect(valid).toBeTypeOf("string");
    });
    test.each([
      [2, true],
      [4, false],
      ["to", true],
      ["four", false],
      [[1,2], true],
      [[1,2,3,4], false],
      [{ foo: "bar" }, false],
      [null, false],
      [true, false],
      [false, false],
    ])("no return when passed a Validator object (%s)", (val, result) => {
      const valid = new Validator(val);
      Validator.MAX(2, valid);
      const errors = valid.getErrors();
      if (result) expect(errors).toBeNull();
      if (!result) {
        expect(errors).toBeTypeOf("object");
        expect(errors).toHaveLength(1);      
      }
    });

    test("instance returns this", () => {
      const valid = new Validator("something");
      let errors = valid.max(4).getErrors();
      expect(errors).toBeTypeOf("object");
      expect(errors).toHaveLength(1);
      valid.value = "this";
      errors = valid.max(4).getErrors();
      expect(errors).toBeNull();
    });
  }); 
});