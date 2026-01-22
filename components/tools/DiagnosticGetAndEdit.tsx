"use client"

import React, { useEffect, useState } from "react";
import { FetchResponseData, useFetch } from "@/hooks/useFetch";
import { useInput } from "@/hooks/useInput";
import { Input } from "../inputs/Input";
import { useAlertCtx } from "@/context/AlertContext";

const get = async () => fetch("/api/test");
const post = async (name: string, data: { email: string, password: string }) => fetch("/api/test", {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name, data }),
});

interface TestResponseData extends FetchResponseData {
  name: string,
  email: string,
  password: string,
}

export const DiagnosticGetAndEdit = (): React.ReactNode => {
  const { data: getData, refetch } = useFetch<TestResponseData>(get);  
  const { data: postData, refetch: postFetch, loading } = useFetch<FetchResponseData, [string, { email: string, password: string }]>(post, {}, { immediate: false });
  
  const [ edit, setEdit ] = useState(false);
  const [canceled, setCanceled ] = useState(false);

  const name = useInput("name", "");
  const email = useInput("email", "");
  const password = useInput("password", "");

  const { addAlert } = useAlertCtx();

  useEffect(() => {
    if (getData && getData.name && getData.password && getData.email) {
      name.setValue(getData.name);
      email.setValue(getData.email);
      password.setValue(getData.password);
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
      postFetch(name.value, { email: email.value, password: password.value });
      setCanceled(false);
    }
    setEdit(prev => !prev);
  }

  const onCancel = () => {
    setEdit(false);
    setCanceled(true);
    if (getData.name) {
      name.setValue(getData.name);
    }
  }

  return <div className="mt-4 flex items-center gap-4 justify-between w-[20rem]">
    { !edit && name.value && <p>{ name.value }</p> }
    { edit && <Input hook={name} /> } 

    { !edit && email.value && <p>{ email.value }</p> }
    { edit && <Input hook={email} /> } 
    
    { !edit && password.value && <p>{ password.value }</p> }
    { edit && <Input hook={password} /> } 
    
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