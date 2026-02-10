"use client"

import React, { useEffect } from "react";
import { FetchResponseData, useFetch } from "@/hooks/useFetch"

interface FetchListProps<T extends FetchResponseData> {
  children: (data: Partial<T>) => React.ReactNode;
  fetch: () => Promise<Response>;
  fresh: boolean;
  refresh: () => void;
}

export function GetList<T extends FetchResponseData>({ children, fetch, fresh=true, refresh }: FetchListProps<T>) {
  const { data, loading, error, refetch } = useFetch<T>(fetch);

  // Runs refresh action based on fresh trigger
  useEffect(() => {
    if (!fresh && refresh) {
      refresh();
      refetch();
    }
  }, [refresh, fresh]);

  return <div>
    <p>Eventual Search Bar...</p>
    { loading && <p>Loading...</p> }
    { error && <p className="text-red-500">{ error }</p> }
    { !loading && !error && data && children(data) }
  </div>
}