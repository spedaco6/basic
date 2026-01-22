"use client"

import { useCallback, useEffect, useState } from "react";

export interface FetchResponseData {
  success: boolean,
  message?: string,
  validationErrors?: string[],
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
      setData(result); // todo this might need to be after the reponse.ok check but when it is no validationErrors populate      
      if (!response.ok) throw new Error(result.message ?? "There was a problem logging in");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const reset = useCallback(() => {
    setData({});
    setError("");
    setLoading(false);
  }, []);
  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [immediate, fetch]);

  return {
    error,
    clearError,
    loading,
    data,
    refetch: fetch,
    reset
  }
}