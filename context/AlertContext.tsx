"use client"

import { createContext, useContext, useState } from "react";

interface IAlertContext {
  alerts: string[];
  removeAlert: (alert: string) => void;
  addAlert: (alert: string) => void;
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
  const [alerts, setAlerts] = useState<string[]>([]);
    
    // Removed from alerts array after transition completes
    const removeAlert = ((alert: string) => {
      if (alerts.includes(alert)) {
        setAlerts(prev => {
          return prev.filter(prevAlert => prevAlert !== alert);
        });
      }
    });

    // Add alert
    const addAlert = (alert: string) => {
      setAlerts(prev => [...prev, alert]);
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
