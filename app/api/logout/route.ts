import { NextResponse } from "next/server";

export async function GET() {

  // todo Update database if necessary

  const response = NextResponse.json({ success: true, message: "success" });
  response.cookies.set("refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 0,
  });
  return response;
}