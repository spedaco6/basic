export type ValidatorFn = (val: Validator) => void;

export class Validator {
  public value;
  public name?: string;
  public errors: string[] = [];

  private requiredMsg: string | null = null;

  constructor(val: any, name?: string) {
    this.value = val;
    if (name) {
      this.name = name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  public getErrors = (): string[] | null => {
    const errors = this.errors;
    const blankAllowed = typeof this.value === "string" && !this.value && !this.requiredMsg;
    this.errors = [];
    this.requiredMsg = null;
    if (blankAllowed) return null;
    return errors.length === 0 ? null : errors;
  }

  public require(): this {
    Validator.REQUIRE(this);
    return this;
  }
  static REQUIRE(validator: Validator): void;
  static REQUIRE(value: any): string | null;
  static REQUIRE(val: any): string | null | void {
    const isValidator = val instanceof Validator;
    const err = isValidator && val.name ? val.name + " is required" : "Required field";
    const value = isValidator ? val.value : val;
    let hasError = false;

    switch (typeof value) {
      case "number":
        if (value === 0) hasError = true;
        break;
      default:
        if (!value) hasError = true;
    }

    if (isValidator) {
      val.requiredMsg = err;
      if (hasError) val.addError(err);
    } else {
      return hasError ? err : null;
    }
  };

  public email(): this {
    Validator.EMAIL(this);
    return this;
  }
  static EMAIL(validator: Validator): void;
  static EMAIL(value: string): string | null;
  static EMAIL(val: Validator | string): void | string | null {
    const isValidator = val instanceof Validator;
    const err = isValidator && val.name ? val.name + " is an invalid email address" : "Email address is invalid";
    const value = isValidator ? val.value : val;
    let hasError = false;
    if (typeof value !== "string") hasError = true;
    if (!hasError) {
      const matches = value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      if (!matches) hasError = true;
    }

    if (!isValidator) {
      return hasError ? err : null;
    } else {
      if (hasError) val.addError(err);
    }
  }

  public equals(toEqual: any): this {
    Validator.EQUALS(toEqual, this);
    return this;
  }
  static EQUALS(toEqual: any): ValidatorFn;
  static EQUALS(toEqual: any, validator: Validator): void;
  static EQUALS(toEqual: any, value: any): string | null;
  static EQUALS(toEqual: any, val?: any): ValidatorFn | string | void | null {
    const checkEquality = (valueToValidate: any) => {
      const isEqual = valueToValidate === toEqual;
      const error = isEqual ? null : "Values are not equal";
      return error;
    }

    // return a ValidatorFn
    if (typeof val === "undefined") {
      return (validator: Validator): void => {
        const value = validator.value;
        const error: string | null = checkEquality(value);
        if (error) validator.addError(error);
      };
    }

    const isValidator = val instanceof Validator;
    const value = isValidator ? val.value : val;
    const error = checkEquality(value);
    if (!isValidator) {
      return error ? error : null;
    }
    if (error) val.addError(error);
  }

  public min(min: number): this {
    Validator.MIN(min, this);
    return this;
  }
  static MIN(min: number): ValidatorFn;
  static MIN(min: number, validator: Validator): void;
  static MIN(min: number, value: any): string | null;
  static MIN(min: number, val?: any): ValidatorFn | string | void | null {
    let msg = "Value must be at least " + min;

     // return a ValidatorFn
    if (typeof val === "undefined") {
      return (validator: Validator): void => {
        if (min > 0) Validator.REQUIRE(validator);
        Validator.MIN(min, validator);
      };
    }

    const isValidator = val instanceof Validator;
    const value = isValidator ? val.value : val;

    let error: string | null = null;
    switch (typeof value) {
      case "string":
        if (value.length < min) error = msg;
        break;
      case "number":
        if (value < min) error = msg;
        break;
      case "object":
        if (Array.isArray(value)) {
          if (value.length < min) error = msg;
          break;
        }
      default:
        error = "MIN can only receive a string, number, or array";
    }

    if (!isValidator) {
      return error ? error : null;
    }

    if (min > 0) Validator.REQUIRE(val);
    if (error) val.addError(error);
  }

  public max(max: number): this {
    Validator.MAX(max, this);
    return this;
  }
  static MAX(max: number): ValidatorFn;
  static MAX(max: number, validator: Validator): void;
  static MAX(max: number, value: any): string | null;
  static MAX(max: number, val?: any): ValidatorFn | string | void | null {
    let msg = "Value must be less than " + max;

    // return a ValidatorFn
    if (typeof val === "undefined") {
      return (validator: Validator): void => Validator.MAX(max, validator);
    }
    
    const isValidator = val instanceof Validator;
    const value = isValidator ? val.value : val;
    let error: string | null = null;

    switch (typeof value) {
      case "string":
        if (value.length > max) error = msg;
        break;
      case "number":
        if (value > max) error = msg;
        break;
      case "object":
        if (Array.isArray(value)) {
          if (value.length > max) error = msg;
          break;
        }
      default:
        error = "MAX can only receive a string, number, or array";
    }
   
    // execute function if enough data is provdied
    if (!isValidator) {
      return error ? error : null;
    }
    if (error) val.addError(error);
  }

  private addError(msg: string) {
    if (!this.errors.includes(msg)) this.errors.push(msg);
    const errors = this.errors.filter(err => {
      return !this.requiredMsg || this.errors.length === 1 || err !== this.requiredMsg;
    });
    this.errors = errors;
  }
}
