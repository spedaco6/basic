import React from "react";

export const SidebarHeading = ({ children }: React.PropsWithChildren): React.ReactElement => {
  return <li className="border-b-1 px-4 border-gray-200 uppercase text-sm mt-8 mb-2">
    { children }
  </li>

}