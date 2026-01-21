"use client"

import { useEffect, useState } from "react"

export interface IAlert extends React.PropsWithChildren {
  onTransitionEnd: (alert: string) => void;
  message: string,
}

export const Alert = ({ children, message, onTransitionEnd }: IAlert): React.ReactElement | null => {
  const [ isVisible, setIsVisible ] = useState(true);

  // User click
  const onDismiss = (() => {
    setIsVisible(false);
  });

  const removeAlert = () => {
    if (!isVisible) {
      onTransitionEnd(message);
    }
  }

  const visible = "visible opacity-100 translate-x-0";
  const invisible = "invisible opacity-0 translate-x-20";
  
  // Auto dismiss alerts after 5 seconds
  useEffect(() => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      if (id) clearTimeout(id);
    }
  }, []);

  return <div 
    className={`${ isVisible ? visible : invisible } transition-all shadow-xl duration-300 ease-in
    cursor-pointer group bg-gray-300 min-w-[14rem] w-fit h-[5rem] rounded-md flex items-center p-4 text-xl`}
    onTransitionEnd={removeAlert}
    onClick={onDismiss}
  >
    { children }
    <i className="bi bi-x fixed top-0 right-0 text-2xl transition-all duration-200 group-hover:text-red-500" />
  </div>

}