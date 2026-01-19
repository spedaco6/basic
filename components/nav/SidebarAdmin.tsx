"use client"

import React from "react"
import { SidebarLink } from "./SidebarLink";
import { SidebarHeading } from "./SidebarHeading";
import { useToken } from "@/hooks/useToken";

export const SidebarAdmin = (): React.ReactElement => {
  const { role } = useToken();

  return <>
    { role < 30 && <><SidebarHeading>Admin</SidebarHeading>
      <SidebarLink href="/auth/users">
        <i className="bi bi-person-fill text-2xl" />
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
  </>
};