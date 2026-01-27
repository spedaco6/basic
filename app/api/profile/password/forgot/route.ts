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
    
    // validate email
    const email = xss(body.email);
    if (!email || !isEmail(email)) throw new HTTPError("Invalid email", 422);
    const user = await User.findOne({ email });
    if (!user) throw new HTTPError("Could not find an account with that email", 404);
    
    // Save reset token to user
    const token = await createResetToken({ userId: user.id, userRole: user.role });
    user.resetToken = token;
    await user.save();

    // Send reset email
    await sendResetToken(token);
    
    return NextResponse.json({ success: true, message: "Email send with reset link" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}