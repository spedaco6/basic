import { getAllChecklistItems } from "@/lib/server/api/checklists";
import { HTTPError } from "@/lib/server/errors";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No authorization token provided", 401);
    const token = authHeader.split(" ")[1];

    // complete action
    const items = await getAllChecklistItems(token);

    // send response
    return NextResponse.json({ success: true, message: "Successfully fetched checklist items", items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}