"use client"

import { useEffect } from "react"
import { Alert } from "./Alert";
import { useAlertCtx } from "@/context/AlertContext";

export const Alerts = (): React.ReactElement | null => {
  const { alerts, hasAlerts, removeAlert, addAlert } = useAlertCtx();

  useEffect(() => {
    const id = setTimeout(() => {
      addAlert("This is a new one");
    }, 2000);
    return () => {
      if (id) clearTimeout(id);
    }
  }, []);

  return <div className="flex flex-col gap-4 items-end fixed bottom-0 right-0 p-6">
    { hasAlerts && alerts.map(alert => <Alert 
      key={alert}
      message={alert}
      onTransitionEnd={removeAlert}>
      { alert }
    </Alert> ) }
  </div>

}