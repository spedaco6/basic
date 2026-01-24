"use client"

import type { LoginResponseData } from "@/app/api/login/route";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react"
import { Input } from "../inputs/Input";
import { useInput } from "@/hooks/useInput";

const login = (email: string, password: string): Promise<Response> => {
  return fetch("/api/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
}

export default function LoginForm({ className="" }): React.ReactElement {
  const { data, error, loading, refetch } = useFetch<LoginResponseData, [string, string]>(login, {}, { immediate: false });
  const router = useRouter();
  const email = useInput("email", "");
  const password = useInput("password", "");

  useEffect(() => {
    password.setValue("");
    if (data?.success && data.token) {
      localStorage.setItem("token", data.token);
      router.push("/auth/dashboard");  
    }
  }, [data, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await refetch(email.value, password.value);
  }

  return <form className={`${className} flex flex-col m-4 p-6 bg-gray-200 justify-between rounded-lg h-auto w-100`} onSubmit={onSubmit}>
    <h1 className="text-center text-xl mb-4">LOGIN</h1>
    { error && <p className="text-red-500 mb-4">{ error }</p> }
    <div className="flex flex-col gap-4">
      <Input hook={email} className="bg-white" type="email" placeholder="Email" autoFocus />
      <Input hook={password} className="bg-white" type="password" placeholder="Password" />
      <button className="border bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 rounded-sm">{ !loading ? "Login" : 
        <div className="animate-spin">
          <i className="bi bi-arrow-clockwise text-2xl" />
        </div> }
      </button>
    </div>
  </form>

}
