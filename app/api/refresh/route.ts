import { FetchResponseData } from "@/hooks/useFetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "@/lib/server/tokens";
import { User } from "@/lib/server/models/User";
import { v4 } from "uuid";
import { HTTPError } from "@/lib/server/errors";

export interface RefreshResponseData extends FetchResponseData {
  token: string
}

export async function GET() {
  let user;
  let verified;
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh");
    if (!refreshToken) return NextResponse.redirect("/login");
    
    // Validate refresh token
    verified = await verifyRefreshToken(refreshToken.value);
    if (!verified) throw new HTTPError("Unverified refresh token", 401);

    // Check jti
    user = await User.findById(verified.userId);
    if (!user) throw new HTTPError("No user found", 404);
    if (!user.jti || user.jti !== verified.jti) throw new HTTPError("Invalid refresh token", 401);

    // Get new access token
    const payload = { userId: verified.userId, userRole: verified.userRole };
    const accessToken = await createAccessToken(payload);

    // Create new jti and save to user
    const jti = v4();
    user.jti = jti;
    await user.save();


    // TESTING todo
    const updatedUser = await User.findById(user.id);
    if (updatedUser) console.log("user jti: ", updatedUser.jti);
    console.log("new jti: ", jti);

    
    // Create refresh token with new jti
    const newRefreshToken = await createRefreshToken({ ...payload, jti });
    const response = NextResponse.json({ success: true, token: accessToken, message: "Token refreshed" });
  
    // Return response with token and cookie
    response.cookies.set("refresh", newRefreshToken, {
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