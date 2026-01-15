import { NextResponse } from "next/server";

export async function GET(request: Request) {

  await new Promise(res => setTimeout(res, 2000));

  const response = NextResponse.json({ message: "success" });
  response.cookies.set("refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    path: "/",
    maxAge: 0,
  });


  return response;
}