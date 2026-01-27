import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({ 
  searchParams
 }: {
  searchParams: Promise<{ auth: string }>
 }) {
  const sp = await searchParams;
  const token = sp.auth;
  if (!token) return redirect("/password/forgot");

  return <main>
    <ResetPasswordForm token={token} />
  </main>
}