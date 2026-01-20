"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export interface Alert {
  message: string,
  visible: boolean,
}

export const Alert = (): React.ReactElement | null => {
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    { visible: true, message: "Test alert one" },
    { visible: true, message: "Test alert two" },
    { visible: true, message: "This is a third" },
    { visible: true, message: "These can't repeat" },
    { visible: true, message: "What if I have a really long one? How will that be handled?" },
  ]);

  const hasAlerts = alerts.length > 0;

  // Removed from alerts array after transition completes
  const removeAlert = ((alert: string) => {
    const existingAlert = alerts.find(a => a.message === alert);
    if (existingAlert && !existingAlert.visible) {
      setAlerts(prev => {
        return prev.filter(prevAlert => prevAlert.message !== alert);
      });
    }
  });

  // User click
  const hideAlert = ((alert: string) => {
    setAlerts(prev => {
      const updated = [ ...prev ];
      const index = prev.findIndex(prevAlert => prevAlert.message === alert);
      if (index === -1) return updated;

      const updatedAlert = { visible: false, message: alert };
      updated[index] = updatedAlert;
      return updated;
    });
  });

  const addAlert = (message: string) => {
    setAlerts(prev => {
      const updated = [...prev, {
        visible: true,
        message
      }];
      return updated;
    })
  }

  const visible = "visible opacity-100 translate-x-0";
  const invisible = "invisible opacity-0 translate-x-20";
  
  // Auto dismiss alerts after 5 seconds
  useEffect(() => {
    const id = setTimeout(() => {
      setAlerts(prev => {
        const updated = prev.map(alert => {
          return {
            visible: false,
            message: alert.message,
          }
        });
        return updated;
      })
    }, 5000);

    return () => {
      if (id) clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    let element = document.getElementById("alert");

    // Create <div id="alert"> if one does not exist
    if (!element) {
      element = document.createElement("div");
      element.id = "alert";
      element.className="fixed bottom-0 right-0 p-6"
      document.body.append(element);
    }

    // Set root of the portal
    setPortalRoot(element);

    // Cleanup generated div if we created it dynamically
    return () => {
      if (element && !document.getElementById("alert")) {
        document.body.removeChild(element);
      }
    }
  }, []);

  // Return nothing until dom is ready
  if (!portalRoot) return null;

  return createPortal(<div className="flex flex-col gap-4 items-end">
    { hasAlerts && alerts.map(alert => <div 
        key={alert.message}
        className={`${ alert.visible ? visible : invisible } transition-all shadow-xl duration-300 ease-in
        cursor-pointer group bg-gray-300 min-w-[14rem] w-fit h-[5rem] rounded-md flex items-center p-4 text-xl`}
        onTransitionEnd={() => removeAlert(alert.message)}
        onClick={() => hideAlert(alert.message)}
      >
        { alert.message }
        <i className="bi bi-x fixed top-0 right-0 text-2xl transition-all duration-200 group-hover:text-red-500" />
    </div> ) }
  </div>, portalRoot )

}