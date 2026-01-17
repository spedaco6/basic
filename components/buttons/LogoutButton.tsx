"use client"

import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const logout: () => Promise<Response> = () => fetch("/api/logout");

export function LogoutButton(): React.ReactElement {
  const { data, error, loading, refetch } = useFetch(logout, {}, { immediate: false });
  const router = useRouter();

  useEffect(() => {
    if (data?.success) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [data, router]);

  return <div>
   { error && <p className="text-red-500">{error}</p>}
    <button 
      onClick={refetch} className="py-1 px-2 text-black flex justify-center rounded-lg cursor-pointer"
      title="Logout"
    >
      { loading ? 
        <div className="animate-spin">
          <i className="bi bi-arrow-clockwise text-2xl" />
        </div> : 
        <i className="bi bi-box-arrow-right text-2xl" /> }
    </button>
  </div>
}