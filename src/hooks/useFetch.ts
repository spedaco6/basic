import { useCallback, useEffect, useRef, useState } from "react";
import type { ValidationErrors } from "../lib/client/errors";
import type { Pagination } from "./usePagination";

type MethodTypes = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type FetchBody = Record<string, unknown> | string;
export type ResultPagination = Pagination & {
  totalItems: number;
}

export type RefetchFunction = {
  // DELETE signatures
  (method: "DELETE" | "delete"): Promise<void>;
  
  // GET signatures
  (): Promise<void>;
  (searchParams: string): Promise<void>;
  
  // GET or POST signature
  (body: Record<string, unknown>): Promise<void>;
  
  // PUT or PATCH signature
  (body: Record<string, unknown>, method: MethodTypes): Promise<void>;
}

export type FetchResponseData<T extends Record<string, any> = Record<string, any>> = {
  success: boolean,
  message?: string,
  validationErrors?: ValidationErrors,
  data?: T | T[],
  pagination?: ResultPagination
};

/**
 * Manages fetch state.
 * @param url Relative url for api call.
 * @param callImmediately Defines initial loading state and fetch call. Prevent flash of default state by setting this param to "loadingOnly".
 * @param initHeaders Optional initial headers to include with every request (e.g., Auth tokens).
 * @returns 
 */
export function useFetch<
  T extends Record<string, any>
>(
  url: string,
  callImmediately: boolean | "loadingOnly" = false,
  initHeaders?: HeadersInit
) {
  const [ data, setData ] = useState<FetchResponseData<T> | null>(null);
  const [ loading, setLoading ] = useState(!!callImmediately);
  const [ error, setError ] = useState<string | null>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  const refetch: RefetchFunction = useCallback(async (
    arg1?: FetchBody, 
    arg2?: MethodTypes,
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    // abort previous call if necessary
    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    let method: MethodTypes = "GET";
    let body: Record<string, unknown> | undefined;

    // Determine body for DELETE requests
    if (typeof arg1 === "string" && arg1.toLowerCase() === "delete") {
      method = "DELETE";

    // Determine body for POST, PUT, PATCH requests
    } else if (typeof arg1 === "object") {
      method = "POST";
      body = arg1;
      if (typeof arg2 === "string") {
        method = arg2;
      }
    }
  
    // Set headers
    const headers: HeadersInit = {
      ...initHeaders,
      ...(body ? { "Content-Type": "application/json" } : {})
    };
    let activeAbortSignal;
    try {
      // body assembly
      activeAbortSignal = abortCtrl.current.signal;
      const fetchOptions: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: activeAbortSignal,
      }

      // construct full fetch url
      const fullUrl = method === "GET" && arg1 ? url + arg1 : url;

      // fetch data
      const response = await fetch(fullUrl, fetchOptions);
      const resData = await response.json() as FetchResponseData<T>;

      if (!resData.success) throw new Error(resData.message);
      setData(resData);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      if (abortCtrl?.current?.signal === activeAbortSignal) {
        setLoading(false);
      }
    }
  }, [url, initHeaders]);

  const reset = () => {
    if (abortCtrl.current) abortCtrl.current.abort();
    setError(null);
    setLoading(false);
    setData(null);
  };

  useEffect(() => {
    if (callImmediately && typeof callImmediately === "boolean") refetch();
  }, [callImmediately, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  }
}