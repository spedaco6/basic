"use client"

import React, { createContext, useContext, useState } from "react"

type RefreshType = (() => Promise<void>) | null;

interface RefreshContextProps {
  refresh: RefreshType;
  createRefresh: (fn: RefreshType) => void;
}

const RefreshContext = createContext<RefreshContextProps>({
  refresh: null,
  createRefresh: (fn: RefreshType) => {},
});

export const useRefreshContext = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    throw new Error("useRefreshContext must be used within a RefreshContextProvider");
  }
  return ctx;
}

export const RefreshContextProvider = ({ children }: React.PropsWithChildren) => {
  const [ refresh, setRefresh ] = useState<RefreshType>(null);

  const createRefresh = (fn: RefreshType) => {
    setRefresh(fn);
  }

  const value = {
    refresh,
    createRefresh,
  }

  return <RefreshContext.Provider value={value}>
    { children }
  </RefreshContext.Provider>
}