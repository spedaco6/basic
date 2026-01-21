"use client"

import { Alert } from "./Alert";
import { useAlertCtx } from "@/context/AlertContext";

export const Alerts = (): React.ReactElement | null => {
  const { alerts, hasAlerts, removeAlert, addAlert } = useAlertCtx();

  return <div className="flex flex-col gap-4 items-end fixed bottom-0 right-0 p-6">
    { hasAlerts && alerts.map(alert => {
      return <Alert 
        key={alert.id}
        message={alert.message}
        onTransitionEnd={removeAlert}>
        { alert.message }
      </Alert> 
    }) }
  </div>

}