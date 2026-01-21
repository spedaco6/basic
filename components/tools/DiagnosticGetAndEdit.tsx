"use client"

import { FetchResponseData, useFetch } from "@/hooks/useFetch";
import { useInput } from "@/hooks/useInput";
import React, { useEffect, useState } from "react";
import { Input } from "../inputs/Input";
import { useAlertCtx } from "@/context/AlertContext";

const get = async () => fetch("/api/test");
const post = async (email: string) => fetch("/api/test", {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});

export const DiagnosticGetAndEdit = (): React.ReactNode => {
  const { data: getData, refetch } = useFetch<FetchResponseData & { email: string }>(get);  
  const { data: postData, refetch: postFetch, loading } = useFetch<FetchResponseData, [string]>(post, {}, { immediate: false });
  const [ edit, setEdit ] = useState(false);
  const email = useInput("email", "");
  const { addAlert } = useAlertCtx();
  const [canceled, setCanceled ] = useState(false);


  useEffect(() => {
    if (getData && getData.email) {
      email.setValue(getData.email);
    }
  }, [getData]);

  useEffect(() => {
    if (postData.success === true) {
      addAlert("Saved");
    }
    refetch();
  }, [postData]);
  
  const onClick = () => {
    if (edit) {
      postFetch(email.value)
      setCanceled(false);
    }
    setEdit(prev => !prev);
  }

  const onCancel = () => {
    setEdit(false);
    setCanceled(true);
    if (getData.email) {
      email.setValue(getData.email);
    }
  }

  return <div className="mt-4 flex items-center gap-4 justify-between w-[20rem]">
    { !edit && email.value && <p>{ email.value }</p> }
    { edit && <Input hook={email} /> } 
    { edit && <button onClick={onCancel}>Cancel</button> }
    <button onClick={onClick} className="flex items-center gap-2 py-1 min-w-fit justify-between px-2 bg-gray-700 hover:bg-gray-500 text-white rounded-lg cursor-pointer">
      { edit ? "Save" : "Edit" }
      { !edit && loading && <div className="animate-spin w-fit">
        <i className="bi bi-arrow-clockwise text-xl" />
      </div> }
      { !edit && !canceled && postData.success && !loading && <i className="bi bi-check text-2xl" /> }
    </button>
  </div>
}