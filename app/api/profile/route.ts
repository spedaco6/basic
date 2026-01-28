import { FetchResponseData } from "@/hooks/useFetch";
import { NextResponse } from "next/server";
import { HTTPError } from "@/lib/server/errors";
import { deleteProfile, getProfile, updateProfile } from "@/lib/server/api/profile";

export interface ProfileResponseData extends FetchResponseData {
  profile: {
    userId: number,
    userRole: number,
    email: string,
    firstName: string,
    lastName: string,
  }
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
    return NextResponse.json({ 
      success: true, message: "User profile provided", profile: userProfile
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PUT(req: Request): Promise<Response> {
  try {
    // Get body
    const body = await req.json();

    // Get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No token provided", 401);
    const token = authHeader.split(" ")[1];
    // Complete action
    await new Promise(res => setTimeout(res, 2000));
    const updatedProfile = await updateProfile(body, token);
    // Send response
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated",
      profile: updatedProfile,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    const payload = err instanceof HTTPError ? err.payload : [];
    return NextResponse.json({ success: false, message, validationErrors: payload }, { status });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    // Get body
    const body = await req.json();

    // Get token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HTTPError("No token provided", 401);
    const token = authHeader.split(" ")[1];

    // Delete profile
    await deleteProfile(body.password, token);

    // Return deleted confirmation response
    const response = NextResponse.json({ success: true, message: "Profile deleted" });
    response.cookies.set("refresh", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict',
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
