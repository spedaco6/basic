import type { FetchResponseData } from "@/hooks/useFetch";
import { User } from "@/lib/server/models/User";
import { createAccessToken, createRefreshToken } from "@/lib/server/tokens";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";
import { v4 } from "uuid";
import { HTTPError } from "@/lib/server/errors";

export interface LoginResponseData extends FetchResponseData {
  token: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    // Sanitize and validate data
    const email = xss(body.email);
    const password = xss(body.password);
    
    // Authenticate user
    const user = await User.findOne({ email });
    if (!user) throw new HTTPError("Incorrect email or password", 403);
    
    // validate password
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) throw new HTTPError("Incorrect email or password", 403);
      
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
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}