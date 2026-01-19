import { FetchResponseData } from "@/hooks/useFetch";
import { verifyAccessToken } from "@/lib/client/tokens";
import { NextResponse } from "next/server";

export interface ProfileResponseData extends FetchResponseData {
  userId: number,
  userRole: number,
  firstName: string,
  lastName: string,
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

  // Try to check refresh token?

  // Find user

  // Ensure user role allows for profile viewing

  // Return profile
  const response = NextResponse.json({ 
    success: true,
    message: "User profile provided",
    userId: 1, 
    userRole: 30,
    firstName: "Purely",
    lastName: "Fictitious",
    email: "email@email.com",
  });

  return response;
}