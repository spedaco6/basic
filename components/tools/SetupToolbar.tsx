"use client"

import { useAlertCtx } from "@/context/AlertContext";
import { useFetch } from "@/hooks/useFetch"
import { createTestUsers, deleteTestUsers } from "@/lib/client/api/diagnostics";
import { useEffect } from "react";

export const SetupToolbar = () => {
  const postReq = useFetch(createTestUsers, {}, { immediate: false });
  const deleteReq = useFetch(deleteTestUsers, {}, { immediate: false });

  const isLoading = postReq.loading || deleteReq.loading;

  const { addAlert } = useAlertCtx();

  useEffect(() => {
    if (postReq.data.message) addAlert(postReq.data.message);
  }, [postReq.data]);
  
  useEffect(() => {
    if (deleteReq.data.message) addAlert(deleteReq.data.message);
  }, [deleteReq.data]);
  

  return <div className="mt-4 flex gap-4 items-center">
    <button 
      className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
      onClick={postReq.refetch}>Setup test users</button>
    <button 
      className="py-1 min-w-fit px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
      onClick={deleteReq.refetch}>Delete test users</button>
    { isLoading && <p>Loading...</p> }
  </div>
}