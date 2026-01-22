import { NextResponse } from "next/server";

const data = {
  email: "email@email.com",
  firstName: "Purely",
  lastName: "Fictitious",
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Success", 
    profile: data,
  });
}
export async function POST(req: Request) {
  await new Promise(res => setTimeout(res, 2000));
  const body = await req.json();
  data.email = body.data.email;
  data.firstName = body.data.firstName;
  data.lastName = body.data.lastName;
  return NextResponse.json({ success: true, message: "Success", profile: data });
}