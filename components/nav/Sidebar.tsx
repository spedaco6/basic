import React from "react";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarLink } from "./SidebarLink";
import { SidebarAdmin } from "./SidebarAdmin";

export const Sidebar = (): React.ReactElement => {

  return <div className="mt-12 text-gray-500 uppercase">
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
      
      <SidebarAdmin />
      
    </ul>
  </div>
}