"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "../inputs/Input";
import { Button } from "../buttons/Button";
import { FormEvent, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";

const sendForgotPasswordLink = async (email: string) => {
  return fetch("/api/profile/password/forgot", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email }),
  });
};

export const ForgotPasswordForm = () => {
  const email = useInput("email*", "");
  const { data, refetch, loading, error } = useFetch(sendForgotPasswordLink, {}, { immediate: false }); 

  useEffect(() => {
    email.setValue("");
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    refetch(email.value);
  }

  return <form 
    className="flex flex-col gap-4 m-4 p-6 bg-gray-200 justify-between rounded-lg h-auto w-100"
    onSubmit={handleSubmit}>
    { error && <p className="text-red-500">{ error }</p> }
    <Input hook={email} placeholder="Email" className="bg-white" />
    <Button disabled={loading}>Send Password Reset Link</Button>
  </form>
  
}