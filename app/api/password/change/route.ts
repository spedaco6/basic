import { User } from "@/lib/server/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";
import { verifyAccessToken } from "@/lib/server/tokens";

export const POST = async (req: Request) => {
  try {
    // Sanitize
    const body = await req.json();
    const password = xss(body.password);
    const newPassword = xss(body.password);

    // Validate
    const validationErrors = [];
    if (newPassword.length < 8) validationErrors.push("Passwords must be 8 characters");
    const matches = newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
    if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
    if (validationErrors) return NextResponse.json({ 
      success: false, 
      message: "New password is invalid", 
      validationErrors 
    }, { status: 422 });

    // Authenticate / Authorize
    const header = req.headers.get("Authorization");
    if (!header) throw new Error("No token provided");
    const token = header.split(" ")[1];
    if (!token) throw new Error("No token provided");
    const payload = await verifyAccessToken(token);
    if (!payload) throw new Error("Invalid token");
    const user = await User.findById(payload.userId);
    if (!user) throw new Error("Could not find user");
    const compare = bcrypt.compare(password, user.password);
    if (!compare) throw new Error("Incorrect password");

    // Complete action
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // Send response
    return NextResponse.json({ success: true, message: "Password changed" }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
}