"use client"

import React, { useEffect } from "react";
import { FetchResponseData, useFetch } from "@/hooks/useFetch"
import { useRefreshContext } from "@/context/RefreshContext";

interface FetchListProps<T extends FetchResponseData> {
  children: (data: Partial<T>) => React.ReactNode;
  fetch: () => Promise<Response>
}

export function GetList<T extends FetchResponseData>({ children, fetch }: FetchListProps<T>) {
  const { data, loading, error, refetch } = useFetch<T>(fetch);
  const { refresh, cancelRefresh } = useRefreshContext();

  useEffect(() => {
    if (refresh) {
      cancelRefresh();
      // setTimeout(() => refetch(), 500);
      refetch();
    }
  }, [refresh]);

  return <div>
    <p>Eventual Search Bar...</p>
    { loading && <p>Loading...</p> }
    { error && <p className="text-red-500">{ error }</p> }
    { !loading && !error && data && children(data) }
  </div>
}