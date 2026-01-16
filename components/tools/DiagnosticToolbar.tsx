"use client"

import { RefreshResponseData } from "@/app/api/refresh/route";
import { useFetch } from "@/hooks/useFetch";
import React from "react"
import { Alert } from "../alert/Alert";

const refresh: () => Promise<Response> = () => fetch("/api/refresh");

export const DiagnosticToolbar = (): React.ReactElement => {
  const { data, refetch } = useFetch<RefreshResponseData>(refresh, {}, { immediate: false });
  
  return <div>
    <div className="flex gap-4 items-center">
      <button onClick={refetch} className="py-1 px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer">Test Refresh Token Endpoint</button>
      { data?.success && <Alert>Success!</Alert> }
    </div>
  </div>
}