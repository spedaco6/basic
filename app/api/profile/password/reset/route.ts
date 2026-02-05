import { HTTPError } from "@/lib/server/errors";
import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/server/api/profile";

export const PATCH  = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();

    // get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No reset token provided", 401);
    const token = authHeader.split(" ")[1];

    // complete action
    if (process.env.NODE_ENV !== "production") await new Promise(res => setTimeout(res, 2000));
    await resetPassword(body.newPassword, body.confirmPassword, token);

    // return response
    return NextResponse.json({ success: true, message: "Password reset" }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];
    return NextResponse.json({ success: false, message, validationErrors: payload }, { status });
  }
}