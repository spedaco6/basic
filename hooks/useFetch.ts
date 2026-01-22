"use client"

import { useCallback, useEffect, useState } from "react";

export interface FetchResponseData {
  success: boolean,
  message?: string,
  error?: string,
}

interface FetchOptions {
  immediate: boolean,
}

export const useFetch = <
  Data extends FetchResponseData, 
  Args extends unknown[] = [],
>(
  fetchFn: (...args: Args) => Promise<Response>, 
  initData?: Partial<Data>,
  options?: Partial<FetchOptions>,
) => {
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState<string>("");
  const [ data, setData ] = useState<Partial<Data>>(initData ?? {});

  const immediate: boolean = options?.immediate ?? true;

  const fetch = useCallback(async (...args: Args | []) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchFn(...(args as Args));
      const result: Partial<Data> = await response.json();
      if (!response.ok) throw new Error(result.message ?? "There was a problem logging in");
      setData(result);      
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [immediate, fetch]);

  return {
    error,
    loading,
    data,
    refetch: fetch,
  }
}