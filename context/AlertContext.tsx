"use client"

import { nanoid } from "nanoid";
import { createContext, useContext, useState } from "react";

interface Alert {
  message: string,
  id: string,
}

interface IAlertContext {
  alerts: Alert[];
  removeAlert: (id: string) => void;
  addAlert: (message: string) => void;
  hasAlerts: boolean;
}

const AlertContext = createContext<IAlertContext>({
  alerts: [],
  removeAlert: () => {},
  addAlert: () => {},
  hasAlerts: false,
});

export const useAlertCtx = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlertCtx must be used within an AlertContextProvider");
  }
  return ctx;
}

export const AlertContextProvider = ({ children }: React.PropsWithChildren) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
    
  // Remove an alert
  const removeAlert = ((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  });

  // Add an alert
  const addAlert = (message: string) => {
    const id = nanoid();
    setAlerts(prev => [...prev, { id, message }]);
  }

  const value = {
    alerts,
    addAlert,
    removeAlert,
    hasAlerts: alerts.length > 0,
  }

  return <AlertContext.Provider value={value}>
    { children }
  </AlertContext.Provider>
}
