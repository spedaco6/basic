import { NextResponse } from "next/server";
import { useState } from "react";

interface FetchData {
  success: boolean,
  message?: string,
  error?: string,
}

export const useFetch = (
  fetchFn: () => Promise<Response>, 
  initData: Partial<FetchData>
) => {
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>("");
  const [ data, setData ] = useState<Partial<FetchData>>(initData);

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchFn();
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "There was a problem logging in");
      setData(result);      
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    error,
    loading,
    data,
    refetch: fetch,
  }
}