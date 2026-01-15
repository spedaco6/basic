"use client"

import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const logout: () => Promise<Response> = () => fetch("/api/logout");

export function LogoutButton(): React.ReactElement {
  const { data, error, loading, refetch } = useFetch(logout, {});
  const router = useRouter();

  useEffect(() => {
    if (data?.success) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [data, router]);

  return <div>
   {error && <p className="text-red-500">{error}</p>}
    <button onClick={refetch}>
      { loading ? "Logging out" : "Logout" }
    </button>
  </div>
}