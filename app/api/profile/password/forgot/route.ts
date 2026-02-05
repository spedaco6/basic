import { forgotPassword } from "@/lib/server/api/profile";
import { HTTPError } from "@/lib/server/errors";
import { NextResponse } from "next/server";

export const POST = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    
    if (process.env.NODE_ENV !== "production") await new Promise(res => setTimeout(res, 2000));
    await forgotPassword(body.email);
    
    return NextResponse.json({ success: true, message: "Email send with reset link" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}