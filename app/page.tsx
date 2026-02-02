import { redirect } from "next/navigation"

export default async function Home() {
  redirect("/login");
  return <main>
    <h1>HOME</h1>
  </main>
}
