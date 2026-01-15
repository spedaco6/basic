"use client"

import { LogoutButton } from "@/components/buttons/LogoutButton";
import { useFetch } from "@/hooks/useFetch";

const refresh: () => Promise<Response> = () => fetch("/api/refresh");

export default function Dashboard() {

  const { data, refetch } = useFetch(refresh, {});
  console.log(data);

  return <main className="p-4">
    <h1 className="text-2xl">DASHBOARD</h1>
    <button onClick={refetch}>Refresh Token</button>    
  </main>
}
