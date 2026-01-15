import type { FetchResponseData } from "@/hooks/useFetch";
import { NextResponse } from "next/server";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

export async function POST(request: Request): Promise<Response> {
  const { email, password } = await request.json();
  // todo Sanitize and validate data

  // todo Authenticate user
  
  // todo Create new access and refresh tokens
  await new Promise(res => setTimeout(res, 2000));
  const accessToken = "token123";
  const refreshToken = "TOKEN_ABC";

  // Return response with token and cookie
  const response = NextResponse.json({ success: true, token: accessToken, message: "Success" });
  response.cookies.set("refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days 
  });

  return response;
}