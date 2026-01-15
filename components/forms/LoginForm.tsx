"use client"

import { LoginData } from "@/app/api/login/route";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react"

const login = async (email: string, password: string): Promise<Response> => {
  return fetch("/api/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
}

export default function LoginForm(): React.ReactElement {
  const { data, error, loading, refetch } = useFetch<[string, string], LoginData>(login, {});
  const router = useRouter();
  const [input, setInput] = useState<Record<string, string>>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (data?.success && data.token) {
      localStorage.setItem("token", data.token);
      console.log(data.token);    
      router.push("/auth/dashboard");  
    }
  }, [data, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await refetch(input.email, input.password);
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInput(prev => {
      const updated = { ...prev };
      updated[name] = value;
      return updated;
    });
  }

  return <main>
    <form className="flex flex-col m-4 p-6 gap-4 bg-gray-200 rounded-lg max-w-[25rem]" onSubmit={onSubmit}>
      <h1 className="text-center text-xl">LOGIN</h1>
      { error && <p className="text-red-500">{ error }</p> }
      <input className="bg-white p-1 rounded-sm" onChange={onChange} value={input.email} type="email" name="email" placeholder="Email" />
      <input className="bg-white p-1 rounded-sm" onChange={onChange} value={input.password} type="password" name="password" placeholder="Password" />
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer p-1 rounded-sm">{ loading ? "Submitting..." : "Login"}</button>
    </form>
  </main>
}
