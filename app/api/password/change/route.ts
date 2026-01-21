import { User } from "@/lib/server/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import xss from "xss";
import { verifyAccessToken } from "@/lib/server/tokens";
import { HTTPError } from "@/lib/server/errors";

export const POST = async (req: Request) => {
  try {
    // Sanitize
    const body = await req.json();
    const password = xss(body.password).trim();
    const newPassword = xss(body.password).trim();

    // Validate
    const validationErrors = [];
    if (newPassword.length < 8) validationErrors.push("Passwords must be 8 characters");
    const matches = newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/);
    if (!matches) validationErrors.push("Passwords must contain an upper- and lower-case letter, a number, and a special character.");
    if (validationErrors) throw new HTTPError("New password is invalid", 422, validationErrors);

    // Authenticate / Authorize
    const header = req.headers.get("Authorization");
    if (!header) throw new HTTPError("No token provided", 401);
    const token = header.split(" ")[1];
    if (!token) throw new HTTPError("No token provided", 401);
    const payload = await verifyAccessToken(token);
    if (!payload) throw new HTTPError("Invalid token", 401);
    const user = await User.findById(payload.userId);
    if (!user) throw new HTTPError("Could not find user", 404);
    const compare = bcrypt.compare(password, user.password);
    if (!compare) throw new HTTPError("Incorrect password", 403);

    // Complete action
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // Send response
    return NextResponse.json({ success: true, message: "Password changed" }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : {};
    return NextResponse.json({ success: false, message, ...payload }, { status });
  }
}