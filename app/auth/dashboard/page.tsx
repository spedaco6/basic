"use client"

import { LogoutButton } from "@/components/buttons/LogoutButton";
import { useFetch } from "@/hooks/useFetch";

const refresh: () => Promise<Response> = () => fetch("/api/refresh");

export default function Dashboard() {

  const { data, refetch } = useFetch(refresh, {});
  console.log(data);

  return <main>
    <h1>DASHBOARD</h1>
    <LogoutButton />
    <button onClick={refetch}>Refresh Token</button>
  </main>
}
