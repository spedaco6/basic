"use client"

import { RefreshResponseData } from "@/app/api/refresh/route";
import { useFetch } from "@/hooks/useFetch";
import React, { useEffect, useState } from "react"

const refresh: () => Promise<Response> = () => fetch("/api/refresh");

export const DiagnosticToolbar = (): React.ReactElement => {
  const { data, refetch } = useFetch<any, RefreshResponseData>(refresh, {});
  const [ show, setShow ] = useState(false);
  
  useEffect(() => {
    setShow(true);
    const id = setTimeout(() => {
      setShow(false);
    }, 2000);
    return () => {
      if (id) {
        clearTimeout(id);
      }
    }
  }, [data]);
  return <div>
    <div className="flex gap-4 items-center">
      <button onClick={refetch} className="py-1 px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer">Test Refresh Token Endpoint</button>
      { data?.success && show && <p className="text-green-500">Success!</p> }
    </div>
  </div>
}