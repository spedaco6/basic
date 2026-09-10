import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  
  // POST signature (body only — always POST unless arg2 overrides the method)
  (body: Record<string, unknown>): Promise<void>;
  
  // PUT or PATCH signature
  (body: Record<string, unknown>, method: MethodTypes): Promise<void>;
}

export type UseFetchResult<T extends Record<string, any> = Record<string, any>> = {
  data: FetchResponseData<T> | null;
  loading: boolean;
  error: string | null;
  refetch: RefetchFunction;
  reset: () => void;
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
): UseFetchResult<T> {
  const [ data, setData ] = useState<FetchResponseData<T> | null>(null);
  const [ loading, setLoading ] = useState(!!callImmediately);
  const [ error, setError ] = useState<string | null>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  // Stable base headers, re-derived only when the caller-provided headers'
  // actual content changes — not their reference. This is what lets refetch
  // below stay referentially stable across renders even when a consumer
  // passes initHeaders as a fresh inline object/array literal every render.
  // (Headers instances are normalized to an array before stringifying, since
  // JSON.stringify can't see a Headers instance's contents directly.)
  const headerKey = initHeaders instanceof Headers
    ? JSON.stringify(Array.from(initHeaders.entries()))
    : JSON.stringify(initHeaders);
  const baseHeaders = useMemo(
    () => new Headers(initHeaders),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headerKey]
  );

  const refetch: RefetchFunction = useCallback(async (
    arg1?: FetchBody, 
    arg2?: MethodTypes,
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setData(null);
    
    // abort previous call if necessary
    if (abortCtrl.current) abortCtrl.current.abort();
    abortCtrl.current = new AbortController();

    let method: MethodTypes = "GET";
    let body: Record<string, unknown> | undefined;

    // Determine body for DELETE requests
    if (typeof arg1 === "string" && arg1.toLowerCase() === "delete") {
      method = "DELETE";

    // Body-only calls are always POST unless arg2 overrides the method
    } else if (typeof arg1 === "object") {
      method = "POST";
      body = arg1;
      if (typeof arg2 === "string") {
        method = arg2;
      }
    }
  
    // Clone the stable base headers per call rather than mutating the shared
    // memoized instance directly — Headers.set() mutates in place, and since
    // baseHeaders persists across calls until initHeaders' content changes,
    // mutating it directly would leak Content-Type from one call (e.g. a
    // POST) into a later call that shouldn't have it (e.g. a GET).
    const headers = new Headers(baseHeaders);
    if (body) headers.set("Content-Type", "application/json");

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
  }, [url, baseHeaders]);

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