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

  useEffect(() => {
    if (getData && getData.email) {
      email.setValue(getData.email);
    }
  }, [getData]);

  useEffect(() => {
    refetch();
  }, [postData]);

  const onClick = () => {
    if (edit) {
      postFetch(email.value)
    }
    setEdit(prev => !prev);
  }

  return <div>
    { !edit && email.value && <p>{ email.value }</p> }
    { edit && <Input hook={email} /> }
    <button onClick={onClick}>{edit ? "Save" : "Edit"}</button>
  </div>
}