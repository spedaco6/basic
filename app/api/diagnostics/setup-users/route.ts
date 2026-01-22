import { createTestUsers, deleteTestUsers } from "@/lib/server/api/diagnostics";
import { HTTPError } from "@/lib/server/errors";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No access token provided", 401);
    const token = authHeader.split(" ")[1];

    // Complete action
    await createTestUsers(token);

    return NextResponse.json({ success: true, message: "Test users created"}, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
export async function DELETE(req: Request) {
  try {
    // Get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No access token provided", 401);
    const token = authHeader.split(" ")[1];

    // Complete action
    await deleteTestUsers(token);

    return NextResponse.json({ success: true, message: "Test users deleted"}, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}