import { useState } from "react";

export interface FetchResponseData {
  success: boolean,
  message?: string,
  error?: string,
}

export const useFetch = <Data extends FetchResponseData, Args extends any[] = any>(
  fetchFn: (...args: Args) => Promise<Response>, 
  initData: Partial<Data>
) => {
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>("");
  const [ data, setData ] = useState<Partial<Data>>(initData);

  const fetch = async (...args: Args) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchFn(...args);
      const result: Partial<Data> = await response.json();
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