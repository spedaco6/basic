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
    <button onClick={refetch} className="py-1 px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer">
      { loading ? "Logging out" : "Logout" }
    </button>
  </div>
}