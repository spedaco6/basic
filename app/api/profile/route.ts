import { FetchResponseData } from "@/hooks/useFetch";
import { NextResponse } from "next/server";
import { HTTPError } from "@/lib/server/errors";
import { getProfile, updateProfile } from "@/lib/api/profile";

export interface ProfileResponseData extends FetchResponseData {
  userId: number,
  userRole: number,
  email: string,
  firstName?: string,
  lastName?: string,
}

export async function GET(req: Request): Promise<Response> {
  await new Promise(res => setTimeout(res, 2000));
  try {
    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No authorization token provided", 401);
    
    // Get access token
    const accessToken = authHeader.split(' ')[1];
    
    // Get profile
    const userProfile = await getProfile(accessToken);

    // Return profile
    const response = NextResponse.json({ 
      success: true, message: "User profile provided", ...userProfile
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Get body
    const body = await req.json();

    // Get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No token provided", 401);
    const token = authHeader.split(" ")[1];

    // Complete action
    const updatedProfile = await updateProfile(body, token);

    // Send response
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated",
      ...updatedProfile,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];
    return NextResponse.json({ success: false, message, validationErrors: payload }, { status });
  }
}