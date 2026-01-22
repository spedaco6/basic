"use client"

import { RefreshResponseData } from "@/app/api/refresh/route";
import { useAlertCtx } from "@/context/AlertContext";
import { useFetch } from "@/hooks/useFetch";
import React, { useState } from "react"
import { Modal } from "../ui/Modal";

const refresh: () => Promise<Response> = () => fetch("/api/refresh");

export const DiagnosticToolbar = (): React.ReactElement => {
  const { data, refetch } = useFetch<RefreshResponseData>(refresh, {}, { immediate: false });
  const { addAlert } = useAlertCtx();
  const [ modal, setModal ] = useState(false);
  
  return <div className="flex flex-col gap-2">
    <div className="flex gap-4 items-center flex-wrap">
      <button onClick={refetch} className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer">Test Refresh Token Endpoint</button>
      { data?.success && <p>{ data.token }</p> }
    </div>

    <div>
      <button
        className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
        onClick={() => addAlert("Test successful!")}>Test alert</button>
    </div>
    <div>
      <button
        className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
        onClick={() => setModal(prev => !prev)}>Test Modal</button>
    </div>

    <Modal open={modal} className="flex flex-col justify-between p-4">
      <h1 className="text-center">Success!</h1>
      <div className="w-full flex justify-end">
        <button 
          className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
          onClick={() => setModal(false)}>Close</button>
      </div>
    </Modal> 

  </div>
}