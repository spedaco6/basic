import React from "react";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarLink } from "./SidebarLink";

export const Sidebar = (): React.ReactElement => {

  return <div className="mt-12 text-gray-500 uppercase">
    <ul>
      <SidebarHeading>General</SidebarHeading>
      <SidebarLink href="/auth/dashboard">
        <i className="bi bi-speedometer2 text-2xl" />
        <span className="ml-2">Dashboard</span>
      </SidebarLink>

      <SidebarHeading>User</SidebarHeading>
      <SidebarLink href="/auth/profile">
        <i className="bi bi-person-fill text-2xl" />
        <span className="ml-2">Profile</span>
      </SidebarLink>
    
      <SidebarHeading>Maintenance</SidebarHeading>
      <SidebarLink href="/auth/diagnostics">
        <i className="bi bi-gear text-2xl" />
        <span className="ml-2">Diagnostics</span>
      </SidebarLink>
      
    </ul>
  </div>
}