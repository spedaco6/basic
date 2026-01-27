import { forgotPassword } from "@/lib/server/api/profile";
import { sendResetToken } from "@/lib/server/email";
import { HTTPError } from "@/lib/server/errors";
import { User } from "@/lib/server/models/User";
import { createResetToken } from "@/lib/server/tokens";
import { isEmail } from "@/lib/server/validation";
import { NextResponse } from "next/server";
import xss from "xss";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    
    await forgotPassword(body.email);
    
    return NextResponse.json({ success: true, message: "Email send with reset link" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}