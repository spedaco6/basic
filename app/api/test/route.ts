import { NextResponse } from "next/server";

let email = "email@email.com";

export async function GET() {
  return NextResponse.json({ success: true, message: "Success", email });
}
export async function POST(req: Request) {
  await new Promise(res => setTimeout(res, 2000));
  const body = await req.json();
  email = body.email;
  return NextResponse.json({ success: true, message: "Success", email });
}