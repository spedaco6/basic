import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "production") await new Promise(res => setTimeout(res, 2000));
  return NextResponse.json({ success: true, message: "Test successful!" });
}