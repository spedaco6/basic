import { HTTPError } from "@/lib/server/errors";
import { User } from "@/lib/server/models/User";
import { verifyResetToken } from "@/lib/server/tokens";
import { NextResponse } from "next/server";
import xss from "xss";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@/lib/server/const";

export const PATCH  = async (req: Request) => {
  try {
    console.log("HERE AGAIN");
    const body = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No reset token provided", 401);
    const token = authHeader.split(" ")[1];
    if (!token) throw new HTTPError("No reset token provided", 401);
    
    const verified = await verifyResetToken(token);
    if (!verified) throw new HTTPError("Unverified token", 401);
    const user = await User.findById(verified.userId);
    if (!user) throw new HTTPError("Could not find user", 404);
    if (user.resetToken !== token) throw new HTTPError("Token mismatch", 401);

    const newPassword = xss(body.newPassword).trim();
    const confirmPassword = xss(body.confirmPassword).trim();
    
    // Validate
    const validationErrors = [];
    if (newPassword.length < 8) validationErrors.push("Passwords must be 8 characters");
    const matches = newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
    if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
    if (confirmPassword !== newPassword) validationErrors.push("Passwords do not match");
    if (validationErrors.length) throw new HTTPError("New password is invalid", 422, validationErrors);

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hash;
    user.resetToken = "";
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset" }, { status: 201 });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];

    return NextResponse.json({ success: false, message, payload }, { status });
  }
}