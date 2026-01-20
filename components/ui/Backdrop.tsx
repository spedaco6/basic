"use client"
import { useSidebarCtx } from "@/context/SidebarContext";
import React from "react";

export const Backdrop = (): React.ReactElement => {
  const { open, close } = useSidebarCtx();
  return <>
    { open && <div
      onClick={close}
      className="fixed top-0 bottom-0 left-0 right-0 z-40 bg-gray-500 opacity-40">
    </div>}
  </>
}