import type { FetchResponseData } from "@/hooks/useFetch";
import { User } from "@/lib/models/User";
import { createAccessToken, createRefreshToken } from "@/lib/tokens";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  // Sanitize and validate data
  const email = xss(body.email);
  const password = xss(body.password);

  // todo Server-side validation

  // Authenticate user
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ 
    success: false, 
    message: "Incorrect email or password" 
  }, { status: 403 });
  
  // validate password
  try {
    const decrypt = await bcrypt.compare(password, user.password);
    if (!decrypt) return NextResponse.json({ 
      success: false, 
      message: "Incorrect email or password" 
    }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      message: "Something went wrong. Could not authenticate user" 
    }, { status: 500 });
  }
    
  // Create access and refresh tokens
  const payload = { userId: user.id, userRole: user.role };
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