import { NextResponse } from "next/server";
import { HTTPError } from "@/lib/server/errors";
import { changePassword } from "@/lib/server/api/profile";

export const PUT = async (req: Request): Promise<Response> => {
  try {
    // Get request body
    const body = await req.json();

    // Get authorization header
    const header = req.headers.get("Authorization");
    if (!header) throw new HTTPError("No token provided", 401);

    // Get access token
    const token = header.split(" ")[1];

    // Change password
    await changePassword(body.currentPassword, body.newPassword, body.confirmPassword, token);

    // Send response
    return NextResponse.json({ success: true, message: "Password changed" }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];
    return NextResponse.json({ success: false, message, validationErrors: payload }, { status });
  }
}