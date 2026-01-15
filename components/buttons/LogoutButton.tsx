"use client"

import { redirect } from "next/navigation";
import React, { useState } from "react";

export function LogoutButton(): React.ReactElement {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const logout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/logout");
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Logout failed");
      localStorage.removeItem("token");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
    return redirect("/login");
  }

  return <div>
   {error && <p className="text-red-500">{error}</p>}
    <button onClick={async () => await logout()}>
      { loading ? "Logging out" : "Logout" }
    </button>
  </div>
}