import LoginForm from "@/components/forms/LoginForm";
import { verifyRefreshToken } from "@/lib/server/tokens";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Login() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("refresh");
  const oldToken = cookie?.value ?? "";
  const verified = await verifyRefreshToken(oldToken);
  if (verified) return redirect("/auth/dashboard");

  return <main className="flex justify-center items-center">
    <LoginForm className="mt-[20dvh]" />
  </main>
}
