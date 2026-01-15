import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  await new Promise(res => setTimeout(res, 2000));

  const accessToken = "token123";
  const refreshToken = "TOKEN_ABC";

  const response = NextResponse.json({ token: accessToken, message: "Success" });
  response.cookies.set("refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days 
  });

  return response;
}