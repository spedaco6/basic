import { jwtVerify, SignJWT } from "jose";
import "server-only";
import { TokenPayload } from "../client/tokens";

export interface RefreshTokenPayload extends TokenPayload {
  jti: string,
}

// Create access token
export async function createAccessToken<T extends TokenPayload>(payload: Omit<T, "type">): Promise<string> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const accessToken = await new SignJWT({...payload, type: "general"})
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("15m")
  .sign(accessTokenSecret);
  return accessToken;
}

// Verify access token
export async function verifyAccessToken(accessToken: string): Promise<TokenPayload | null> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const verified = await jwtVerify<TokenPayload>(accessToken, accessTokenSecret);
  if (verified.payload?.type !== "general") throw new Error("Invalid token type");
  return verified.payload ?? null;
}

// Create reset token
export async function createResetToken<T extends TokenPayload>(payload: Omit<T, "type">): Promise<string> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const accessToken = await new SignJWT({...payload, type: "reset"})
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("15m")
  .sign(accessTokenSecret);
  return accessToken;
}

// Verify reset token
export async function verifyResetToken(accessToken: string): Promise<TokenPayload | null> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const verified = await jwtVerify<TokenPayload>(accessToken, accessTokenSecret);
  if (verified.payload?.type !== "reset") throw new Error("Invalid token type");
  return verified.payload ?? null;
}

// Create refresh token
export async function createRefreshToken<T extends RefreshTokenPayload>(payload: Omit<T, "type">): Promise<string> {
  const refreshTokenSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
  const refreshToken = await new SignJWT({...payload, type: "refresh"})
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d")
  .sign(refreshTokenSecret);
  return refreshToken;
}

// Verify refresh token
export async function verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload | null> {
  const refreshTokenSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
  const verified = await jwtVerify<RefreshTokenPayload>(refreshToken, refreshTokenSecret);
  if (verified.payload?.type !== "refresh") throw new Error("Invalid token type");
  return verified.payload ?? null;
}

