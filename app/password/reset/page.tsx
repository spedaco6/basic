import { ResetPasswordForm } from "@/components/forms/profile/ResetPasswordForm";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({ 
  searchParams
 }: {
  searchParams: Promise<{ auth: string }>
 }) {
  const sp = await searchParams;
  const token = sp.auth;
  if (!token) return redirect("/password/forgot");

  return <main className="flex justify-center items-center">
      <ResetPasswordForm token={token} className="mt-[20dvh]" />
    </main>
}