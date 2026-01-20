"use client"

import { useContext, createContext, useState } from "react"

interface ISidebarContext {
  open: boolean;
  toggle: () => void;
  close: () => void;
}
interface ISidebarContextProvider extends React.PropsWithChildren {
  value?: ISidebarContext;
}

const SidebarContext = createContext<ISidebarContext>({
  open: false,
  toggle: () => false,
  close: () => false,
});

export const useSidebarCtx = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebarContext must be used with SidebarContextProvider");
  }
  return ctx;
} 

export const SidebarContextProvider = ({ children, value }: ISidebarContextProvider) => {
  const [ open, setOpen ] = useState(false);
  const toggle = (): void => {
    setOpen(prev => !prev);
  }
  const close = (): void => {
    setOpen(false);
  }

  const sidebarValue: ISidebarContext = {
    open,
    toggle,
    close,
  }

  return <SidebarContext.Provider value={sidebarValue}>
    { children }
  </SidebarContext.Provider>
}
