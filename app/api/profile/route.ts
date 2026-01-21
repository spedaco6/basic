import { FetchResponseData } from "@/hooks/useFetch";
import { verifyAccessToken } from "@/lib/server/tokens";
import { User } from "@/lib/server/models/User";
import { NextResponse } from "next/server";
import { HTTPError } from "@/lib/server/errors";

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

    // Validate token
    const accessToken = authHeader.split(' ')[1];
    const verified = await verifyAccessToken(accessToken);
    if (!verified) throw new HTTPError("Invalid token", 401);

    // Find user
    const user = await User.findById(verified.userId);
    if (!user) throw new HTTPError("Could not find user profile", 404);

    // Ensure user role allows for profile viewing
    if (verified.userId !== user.id && verified.userRole >= 30) {
      throw new HTTPError("User not authorized to view this profile", 401);
    };

    // Return profile
    const response = NextResponse.json({ 
      success: true,
      message: "User profile provided",
      userId: user.id, 
      userRole: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}