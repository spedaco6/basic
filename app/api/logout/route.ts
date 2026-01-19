import { RefreshTokenPayload } from "@/lib/server/tokens";
import { User } from "@/lib/server/models/User";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  let message = "Logged out successfully";
  // Delete user jti to invalidate tokens
  try {
    const cookieStore = await cookies();
    const refresh = cookieStore.get("refresh");
    if (refresh && refresh.value) {
      const { userId } = decodeJwt<RefreshTokenPayload>(refresh.value);
      const user = await User.findById(userId);
      if (user) {
        user.jti = "";
        await user.save();
      }
    }
  } catch (err) {
    message = "Logged out on this device only";
  }

  const response = NextResponse.json({ success: true, message });
  response.cookies.set("refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 0,
  });
  return response;
}