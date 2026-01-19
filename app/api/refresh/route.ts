import { FetchResponseData } from "@/hooks/useFetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "@/lib/client/tokens";

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
  const newRefreshToken = await createRefreshToken(payload); // todo set jti and save to db
  
  const response = NextResponse.json({ success: true, token: accessToken, message: "cookie refreshed" });

  // Return response with token and cookie
  response.cookies.set("refresh", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days 
  });

  return response;
}