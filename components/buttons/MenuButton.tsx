"use client"

import { useSidebarCtx } from "@/context/SidebarContext"

export const MenuButton = () => {
  const { toggle } = useSidebarCtx();
  return <button 
    className="block md:hidden cursor-pointer" 
    title="Menu"
    onClick={toggle}  
  >
    <i className="bi bi-list text-3xl" />
  </button>

}