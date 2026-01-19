import type { FetchResponseData } from "@/hooks/useFetch";
import { User } from "@/lib/server/models/User";
import { createAccessToken, createRefreshToken } from "@/lib/server/tokens";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";
import { v4 } from "uuid";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    // Sanitize and validate data
    const email = xss(body.email);
    const password = xss(body.password);
  
    // todo Server-side validation
  
    // Authenticate user
    const user = await User.findOne({ email });
    if (!user) throw new Error("Incorrect email or password");
    
    // validate password
    const decrypt = await bcrypt.compare(password, user.password);
    if (!decrypt) throw new Error("Incorrect email or password");
      
    // Create access token
    const payload = { userId: user.id, userRole: user.role };
    const accessToken = await createAccessToken(payload);
  
    // Create jti and save to user
    const jti = v4();
    user.jti = jti;
    await user.save();

    // Create refresh token
    const refreshToken = await createRefreshToken({ ...payload, jti });
      
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
    return NextResponse.json({ success: false, message }, { status: 403 });
  }
}