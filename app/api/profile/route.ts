import { FetchResponseData } from "@/hooks/useFetch";
import { verifyAccessToken } from "@/lib/client/tokens";
import { User } from "@/lib/server/models/User";
import { NextResponse } from "next/server";

export interface ProfileResponseData extends FetchResponseData {
  userId: number,
  userRole: number,
  email: string,
}

export async function GET(req: Request): Promise<Response> {
  // Get Authorization header
  await new Promise(res => setTimeout(res, 2000));
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ 
    success: false, message: "No authorization token provided" 
  }, { status: 401 });

  // Validate token
  const accessToken = authHeader.split(' ')[1];
  const verified = await verifyAccessToken(accessToken);
  if (!verified) return NextResponse.json({ success: false, message: "Invalid token" });

  // Find user
  const user = await User.findById(verified.userId);
  if (!user) return NextResponse.json({ success: false, message: "Could not find user profile"});

  // Ensure user role allows for profile viewing
  if (verified.userId !== user.id && verified.userRole >= 30) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  };

  // Return profile
  const response = NextResponse.json({ 
    success: true,
    message: "User profile provided",
    userId: user.id, 
    userRole: user.role,
    email: user.email,
  });

  return response;
}