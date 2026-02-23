import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import { HTTPError } from "../errors";
import { refreshTokens } from "./tokens";
import { jwtVerify, errors } from "jose";
import { JWTInvalid } from "jose/errors";

vi.mock("jose", async () => {
  const actual = await vi.importActual("jose");
  return {
    ...actual,
    jwtVerify: vi.fn(),
  }
});

vi.mock("server-only", () => ({}));
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

  test("successful refresh returns refresh and access tokens", async () => {
    mockAll.mockReturnValue([{ id: 23, role: 20, jti: "123" }]); // mocks find
    mockGet.mockReturnValue(true); // mocks save
    jwtVerify.mockResolvedValue({ payload: { type: "refresh", userId: 23, jti: "123" }});
    
    const { refreshToken, accessToken } = await refreshTokens("oldTokenValue");
    expect(refreshToken).toBeDefined();
    expect(accessToken).toBeDefined();
  });
  
  test("fails when no token is provided", async () => {
    await expect(refreshTokens()).rejects.toThrowError(HTTPError);
    await expect(refreshTokens()).rejects.toHaveProperty("status", 401);
  });
  
  test("fails when token is invalid", async () => {
    jwtVerify.mockRejectedValue(new errors.JWTInvalid("Invalid token"));
    await expect(refreshTokens("token")).rejects.toThrow(JWTInvalid);
    await expect(refreshTokens("token")).rejects.toHaveProperty("message", "Invalid token");
  });

  test("fails when token is not of refresh type", async () => {
    jwtVerify.mockResolvedValue({ type: "wrong" });
    await expect(refreshTokens("token")).rejects.toThrow(Error);
    await expect(refreshTokens("token")).rejects.toHaveProperty("message", "Invalid token type");
  });
  
  test("fails when no user is found with verified id", async () => {
    mockAll.mockReturnValue([]); // mocks find
    jwtVerify.mockResolvedValue({ payload: { userId: 1, type: "refresh" }});
    await expect(refreshTokens("token")).rejects.toThrowError(HTTPError);
    await expect(refreshTokens("token")).rejects.toHaveProperty("status", 404);
    await expect(refreshTokens("token")).rejects.toHaveProperty("message");
  });
  
  test("fails if user has no jti or user jti does not match token jti", async () => {
    mockAll.mockReturnValue([{ id: 23, role: 20, jti: "right-jti" }]); // mocks find
    jwtVerify.mockResolvedValue({ payload: { userId: 1, type: "refresh", jti: "wrong-jti" }});
    await expect(refreshTokens("token")).rejects.toThrowError(HTTPError);
    await expect(refreshTokens("token")).rejects.toHaveProperty("status", 401);
    await expect(refreshTokens("token")).rejects.toHaveProperty("message");
  });
});
