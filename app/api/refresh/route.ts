import { FetchResponseData } from "@/hooks/useFetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { createAccessToken, verifyRefreshToken } from "@/lib/tokens";

export interface RefreshResponseData extends FetchResponseData {
  token: string
}

export async function GET() {
  const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh");
  if (!refreshToken) return NextResponse.redirect("/login");
  
  // Validate refresh token
  const verified = await verifyRefreshToken(refreshToken.value);
  if (!verified) return NextResponse.json({ success: false, message: "invalid token" });

  // Get new access token
  const payload = { userId: 1, userRole: 50 }; // todo
  const accessToken = await createAccessToken(payload);

  return NextResponse.json({ success: true, token: accessToken, message: "cookie refreshed" });
}