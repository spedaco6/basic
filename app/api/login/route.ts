import type { FetchResponseData } from "@/hooks/useFetch";
import { getDb } from "@/lib/database/db";
import { createAccessToken, createRefreshToken } from "@/lib/tokens";
import { NextResponse } from "next/server";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

interface IUser {
  id: number,
  email: string,
  password: string,
  userRole: number,
}

export async function POST(request: Request): Promise<Response> {
  const { email, password } = await request.json();
  // todo Sanitize and validate data

  // todo Authenticate user
  const db = getDb(); // todo set proper db
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as Partial<IUser>;
  if (!user) return NextResponse.json({ 
    success: false, 
    message: "Incorrect email or password" 
  }, { status: 403 });

  // validate password todo hash password
  if (user.password !== password) return NextResponse.json({ 
    success: false, 
    message: "Incorrect email or password" 
  }, { status: 403 });
  
  await new Promise(res => setTimeout(res, 2000)); // todo remove
  
  // Create access and refresh tokens
  const payload = { userId: 1, userRole: 50 };
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
    
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