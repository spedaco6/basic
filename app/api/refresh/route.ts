import { FetchResponseData } from "@/hooks/useFetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTPError } from "@/lib/server/errors";
import { refreshTokens } from "@/lib/api/tokens";

export interface RefreshResponseData extends FetchResponseData {
  token: string
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get("refresh");
    if (!currentRefreshToken) return NextResponse.redirect("/login");
    const currentRefreshTokenValue = currentRefreshToken.value;

    const { refreshToken, accessToken } = await refreshTokens(currentRefreshTokenValue);
    
    const response = NextResponse.json({ success: true, token: accessToken, message: "Token refreshed" });
  
    // Return response with token and cookie
    response.cookies.set("refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict',
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days 
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}