"use client"

import React from "react";

export const Modal = ({ children, open=false, className="" }: React.PropsWithChildren & { open?: boolean, className?: string }): React.ReactNode => {
  const visible = "visible translate-y-0 opacity-100";
  const invisible = "invisible translate-y-5 opacity-0";

  return <div className={`${open ? visible : invisible} z-80 transition-all duration-300 fixed top-0 bottom-0 right-0 left-0 flex justify-center items-center mb-[20dvh]`}>
    <div className={`${className} bg-gray-200 z-80 rounded-md shadow-xl`}>
      { children }
    </div>
  </div>
}