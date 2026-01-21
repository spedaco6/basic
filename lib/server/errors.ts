export class HTTPError extends Error {
  public status: number;
  public payload?: object;
  constructor(message: string, status: number = 500, payload?: object) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}