"use client"

import { useState } from "react"

export const MenuButton = () => {
  const [show, setShow] = useState(false);

  return <button 
    className="block md:hidden cursor-pointer" 
    title="Menu"
    onClick={() => setShow(prev => !prev)}  
  >
    <i className="bi bi-list text-3xl" />
  </button>

}