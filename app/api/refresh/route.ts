import { FetchResponseData } from "@/hooks/useFetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface RefreshResponseData extends FetchResponseData {
  token: string
}

export async function GET() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh");

  if (!refresh) return NextResponse.redirect("/login");
  
  // todo Validate refresh token
  
  // todo Get new access token
  const newToken = "newToken";

  return NextResponse.json({ success: true, token: newToken, message: "cookie refreshed" });
}