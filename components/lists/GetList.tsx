"use client"

import React from "react";
import { FetchResponseData, useFetch } from "@/hooks/useFetch"

interface FetchListProps<T extends FetchResponseData> {
  children: (data: Partial<T>) => React.ReactNode;
  fetch: () => Promise<Response>
}

export function GetList<T extends FetchResponseData>({ children, fetch }: FetchListProps<T>) {
  const { data, loading, error } = useFetch<T>(fetch);

  return <div>
    <p>Eventual Search Bar...</p>
    { loading && <p>Loading...</p> }
    { error && <p className="text-red-500">{ error }</p> }
    { !loading && !error && data && children(data) }
  </div>
}