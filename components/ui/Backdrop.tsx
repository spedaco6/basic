"use client"

import React from "react";
import { useSidebarCtx } from "@/context/SidebarContext";

export const Backdrop = (): React.ReactElement => {
  const { open, close } = useSidebarCtx();
  const conditionalCSS = open ?
    "opacity-40 visible" :
    "opacity-0 invisible"
  return <div
    onClick={close}
    className={`fixed top-0 bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in bg-gray-500 ${conditionalCSS}`}>
  </div> 
}