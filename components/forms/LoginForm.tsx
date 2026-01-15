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

export default function LoginForm(): React.ReactElement {
  const { data, error, loading, refetch } = useFetch<[string, string], LoginResponseData>(login, {});
  const router = useRouter();
  const email = useInput("email", "");
  const password = useInput("password", "");

  useEffect(() => {
    if (data?.success && data.token) {
      localStorage.setItem("token", data.token);
      console.log(data.token);    
      router.push("/auth/dashboard");  
    }
  }, [data, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await refetch(email.value, password.value);
  }

  return <main>
    <form className="flex flex-col m-4 p-6 gap-4 bg-gray-200 rounded-lg max-w-[25rem]" onSubmit={onSubmit}>
      <h1 className="text-center text-xl">LOGIN</h1>
      { error && <p className="text-red-500">{ error }</p> }
      <Input hook={email} className="bg-white" type="email" placeholder="Email" />
      <Input hook={password} className="bg-white" type="password" placeholder="Password" />
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer p-1 rounded-sm">{ loading ? "Submitting..." : "Login"}</button>
    </form>
  </main>
}
