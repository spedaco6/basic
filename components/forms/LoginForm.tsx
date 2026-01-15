"use client"

import { redirect } from "next/navigation";
import React, { ChangeEvent, useState } from "react"

export default function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [ error, setError ] = useState<string>("");
  const [input, setInput] = useState<Record<string, string>>({
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(input.email, input.password);
  }

  const login = async (e: string, p: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: e, password: p })
      });
      
      // Get message from response body
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "There was a problem logging in");

      // Get token
      const { token } = result;
      localStorage.setItem("token", token);
      console.log(token);      
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
    return redirect("/auth/dashboard");
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
