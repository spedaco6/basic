"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "../inputs/Input";
import { Button } from "../buttons/Button";
import { FormEvent, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { forgotPassword } from "@/lib/client/api/profile";

export const ForgotPasswordForm = ({ className="" }) => {
  const email = useInput("email*", "");
  const { data, refetch, loading, error } = useFetch(forgotPassword, {}, { immediate: false }); 

  useEffect(() => {
    email.setValue("");
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    refetch(email.value);
  }

  return <form 
    className={`${className} flex flex-col gap-4 m-4 p-6 bg-gray-200 justify-between rounded-lg h-auto w-100`}
    onSubmit={handleSubmit}>
    <h2 className="text-lg">Enter Email for Reset Link:</h2>
    { error && <p className="text-red-500">{ error }</p> }
    <Input hook={email} placeholder="Email" className="bg-white" autoFocus />
    <Button disabled={loading} className="flex justify-center">
      { loading ? 
        <div className="animate-spin w-fit text-center">
          <i className="bi bi-arrow-repeat text-2xl" />
        </div> : 
        error ? <span><i className="bi bi-exclamation-circle" /> Retry</span> :
        data && data.success ? <span className="flex items-center">Email Sent! <i className="bi bi-check text-2xl m-0" /></span> :
        "Get Reset Link"
      }
    </Button>
   
  </form>
  
}