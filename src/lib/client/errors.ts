export type ValidationErrors = Record<string, string[]>

export class HTTPError extends Error {
  public status;
  constructor(msg: string);
  constructor(status: number);
  constructor(msg: string, status: number);
  constructor(status: number, msg: string);
  constructor(msgStatus: string | number, statusMsg?: string | number) {
    let msg = "";
    let status = 500;
    if (typeof msgStatus === "string") msg = msgStatus;
    if (typeof msgStatus === "number") status = msgStatus;
    if (statusMsg) {
      if (typeof statusMsg === "string") msg = statusMsg;
      if (typeof statusMsg === "number") status = statusMsg;
    }

    super(msg);
    this.status = status;
  }
}

export class ValidationError extends HTTPError {
  public validation;
  constructor(errors: ValidationErrors) {
    super(422, "Invalid user input");
    this.validation = errors;
  }
}