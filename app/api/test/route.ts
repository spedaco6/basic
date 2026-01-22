import { NextResponse } from "next/server";

const data = {
  email: "email@email.com",
  password: "password",
}
let name = "Purely Fictitious";
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Success", 
    email: data.email,
    password: data.password,
    name,
  });
}
export async function POST(req: Request) {
  await new Promise(res => setTimeout(res, 2000));
  const body = await req.json();
  data.email = body.data.email;
  data.password = body.data.password;
  name = body.name;
  return NextResponse.json({ success: true, message: "Success", data, name });
}