"use client"

import React, { createContext, useContext, useState } from "react"

interface RefreshContextProps {
  refresh: boolean;
  callRefresh: () => void;
  cancelRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextProps>({
  refresh: false,
  callRefresh: () => {},
  cancelRefresh: () => {},
});

export const useRefreshContext = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) {
    throw new Error("useRefreshContext must be used within a RefreshContextProvider");
  }
  return ctx;
}

export const RefreshContextProvider = ({ children }: React.PropsWithChildren) => {
  const [ refresh, setRefresh ] = useState(false);
  const callRefresh = () => {
    setRefresh(true);
  }
  const cancelRefresh = () => setRefresh(false);

  const value = {
    refresh,
    callRefresh,
    cancelRefresh,
  }

  return <RefreshContext.Provider value={value}>
    { children }
  </RefreshContext.Provider>
}