"use client"

import React, { createContext, useContext, useState } from "react"

interface RefreshContextProps {
  isFresh: boolean;
  makeStale: () => void;
  refresh: () => void;
}

const RefreshContext = createContext<RefreshContextProps>({
  isFresh: false,
  makeStale: () => {},
  refresh: () => {},
});

export const useRefreshContext = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    throw new Error("useRefreshContext must be used within a RefreshContextProvider");
  }
  return ctx;
}

export const RefreshContextProvider = ({ children }: React.PropsWithChildren) => {
  const [ isFresh, setIsFresh ] = useState(true);
  const makeStale = () => {
    setIsFresh(false);
  }
  const refresh = () => setIsFresh(true);

  const value = {
    isFresh,
    makeStale,
    refresh,
  }

  return <RefreshContext.Provider value={value}>
    { children }
  </RefreshContext.Provider>
}