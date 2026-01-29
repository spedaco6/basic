import { createProfile, getAuthorizedProfiles, updatePermissions } from "@/lib/server/api/profile";
import { HTTPError } from "@/lib/server/errors";
import { User } from "@/lib/server/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
  try {
    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No authorization token provided", 401);
    
    // Get access token
    const token = authHeader.split(' ')[1];

    // Complete action
    const users = await getAuthorizedProfiles(token);
    
    // Send response
    return NextResponse.json({ success: true, message: "Users found", users })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(req: Request): Promise<Response> {
  const body = await req.json();
  try {
    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No authorization token provided", 401);
    
    // Get access token
    const token = authHeader.split(' ')[1];

    // Check if user exists
    const user = await User.findOne({ email: body.email });

    // Complete action
    // Create profile if one does not exist
    if (!user) await createProfile(body, token);
    // Update permissions
    await updatePermissions(body, token);


    console.log(await User.findOne({ email: body.email }));
    // Send response
    return NextResponse.json({ success: true, message: "Account created" }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];
    return NextResponse.json({ success: false, message, validationErrors: payload }, { status });
  }
}