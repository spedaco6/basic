import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import bcrypt from "bcrypt";
import { login } from "./auth";
import { HTTPError } from "../errors";

vi.mock("server-only", () => ({}));

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn(() => true) }
}));

vi.stubEnv("ACCESS_TOKEN_SECRET", "test");
vi.stubEnv("REFRESH_TOKEN_SECRET", "test");

const mockAll = vi.fn();
const mockGet = vi.fn();
// Create a mock for the better-sqlite3 module
vi.mock(import("better-sqlite3"), () => {
  return {
    default: class {
      prepare = vi.fn(() => ({ all: mockAll, get: mockGet }));
    }
  }
});

describe("auth api", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  })

  test("successful login returns refresh and access tokens", async () => {
    mockAll.mockReturnValue([{ id: 23, role: 20, email: "email@email.com", password: "password" }]); // mocks find
    bcrypt.compare.mockResolvedValue(true);
    mockGet.mockReturnValue(true); // mocks save
    const { refreshToken, accessToken } = await login("test@test.com", "password");
    expect(bcrypt.compare).toHaveBeenCalledOnce();
    expect(refreshToken).toBeDefined();
    expect(accessToken).toBeDefined();
  });
  
  test("fails when user is not found", async () => {
    mockAll.mockReturnValue([]); // mocks find
    await expect(login("test@test.com", "password")).rejects.toThrowError(HTTPError);
    await expect(login("test@test.com", "password")).rejects.toThrowError("Incorrect email or password");
  });
  
  test("fails when password is incorrect", async () => {
    mockAll.mockReturnValue([{ id: 23, role: 20, email: "email@email.com", password: "password" }]); // mocks find
    bcrypt.compare.mockResolvedValue(false);
    await expect(login("test@test.com", "password")).rejects.toThrowError(HTTPError);
    await expect(login("test@test.com", "password")).rejects.toThrowError("Incorrect email or password");
  });
  
});
