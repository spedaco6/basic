"use client"

import { useSidebarCtx } from "@/context/SidebarContext"

export const MenuButton = () => {
  const { toggle, open } = useSidebarCtx();
  return <button 
    className="block md:hidden cursor-pointer z-60" 
    title="Menu"
    onClick={toggle}  
  >
    { !open && <i className="bi bi-list text-3xl" />}
    { open && <i className="bi bi-x text-3xl hover:text-red-500" /> }
  </button>

}