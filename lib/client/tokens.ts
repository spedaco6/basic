import { decodeJwt, JWTPayload, jwtVerify, SignJWT } from "jose";

interface TokenPayload extends JWTPayload {
  userId: number,
  userRole: number,
}

export const getToken = async (): Promise<string> => {
  // Try to get existing token
  const token = localStorage.getItem("token");

  // check for token expiration and call refresh if within a certain threshhold
  const isFresh = checkExpiration(token);
  if (token && isFresh) return token;

  // Try to refresh token;
  const newToken = await refreshToken();
  localStorage.setItem("token", newToken);
  return newToken;
}

export const checkExpiration = (token?: string | null): boolean => {
  if (!token) return false;
  try {
    const payload = decodeJwt(token);
    const exp = (payload.exp ? payload.exp - 30 : 0) * 1000; // 30 second buffer included
    const now = Date.now();
    if (now <= exp) return true;
    return false;
  } catch (err) {
    return false;
  }
}

export const refreshToken = async (): Promise<string> => {
  // Try to refresh token
  const response = await fetch("/api/refresh");
  const result = await response.json();
  if (!response.ok) throw new Error(result?.message ?? "Could not refresh token");
  return result.token;
}

// Create access token
export async function createAccessToken<T extends TokenPayload>(payload: T): Promise<string> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const accessToken = await new SignJWT(payload)
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("15m")
  .sign(accessTokenSecret);
  return accessToken;
}

// Verify access token
export async function verifyAccessToken(accessToken: string): Promise<TokenPayload | null> {
  const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
  const verified = await jwtVerify<TokenPayload>(accessToken, accessTokenSecret);
  return verified.payload ?? null;
}

// Create refresh token
export async function createRefreshToken<T extends TokenPayload>(payload: T): Promise<string> {
  const refreshTokenSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(refreshTokenSecret);
  return refreshToken;
}

// Verify refresh token
export async function verifyRefreshToken(refreshToken: string): Promise<TokenPayload | null> {
  const refreshTokenSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
  const verified = await jwtVerify<TokenPayload>(refreshToken, refreshTokenSecret);
  return verified.payload ?? null;
}