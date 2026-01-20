"use client"

import React from "react";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarLink } from "./SidebarLink";
import { useToken } from "@/hooks/useToken";
import { useSidebarCtx } from "@/context/SidebarContext";

export const Sidebar = (): React.ReactElement => {
  const { open } = useSidebarCtx();
  const { role } = useToken();
  const conditionalCSS = open ?
    "translate-x-0" :
    "translate-x-[-100%]";
  return <div className={`w-[16rem] max-w-[80dvw] h-full transition-translate duration-300 ease-in bg-white shadow-2xl ${conditionalCSS} z-50 fixed md:relative md:translate-x-0`}>
    <div className="mt-12 text-gray-500 uppercase">
      <ul>
        <SidebarHeading>General</SidebarHeading>
        <SidebarLink href="/auth/dashboard">
          <i className="bi bi-speedometer2 text-2xl" />
          <span className="ml-2">Dashboard</span>
        </SidebarLink>
        <SidebarLink href="/auth/profile">
          <i className="bi bi-person-fill text-2xl" />
          <span className="ml-2">Profile</span>
        </SidebarLink>
        
        { role < 30 && <><SidebarHeading>Admin</SidebarHeading>
          <SidebarLink href="/auth/users">
            <i className="bi bi-people-fill text-2xl" />
            <span className="ml-2">Users</span>
          </SidebarLink>
        </> }
    
        { role < 20 && <>
          <SidebarHeading>Maintenance</SidebarHeading>
          <SidebarLink href="/auth/diagnostics">
            <i className="bi bi-gear text-2xl" />
            <span className="ml-2">Diagnostics</span>
          </SidebarLink>
        </> }
        
      </ul>
    </div>
  </div> 

}