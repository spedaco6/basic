import type { FetchResponseData } from "@/hooks/useFetch";
import { User } from "@/lib/server/models/User";
import { createAccessToken, createRefreshToken } from "@/lib/server/tokens";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";
import { v4 } from "uuid";
import { HTTPError } from "@/lib/server/errors";
import { login } from "@/lib/server/api/auth";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Get request body
    const body = await request.json();
    
    // Authenticate user and get new token package
    const { refreshToken, accessToken } = await login(body.email, body.password);
      
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}