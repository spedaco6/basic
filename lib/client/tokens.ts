import { decodeJwt, JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  userId: number;
  userRole: number;
  type: "general" | "refresh" | "reset" | "verify";
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

export const deleteToken = () => {
  localStorage.removeItem("token");
}

// Checks expiration returning true if token is still fresh
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