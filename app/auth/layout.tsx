import { LogoutButton } from "@/components/buttons/LogoutButton";
import React from "react";

export default function AuthLayout({ children }: React.PropsWithChildren ): React.ReactElement {
  
  return <div className="flex flex-col h-[100dvh]">
    <div className="p-2 border-b-2 bg-gray-100 border-gray-200 flex justify-end">
      <LogoutButton />
    </div>
    
    <div className="flex-1 flex">

      <div className="w-[20rem] border-r-2 border-gray-600 h-full overflow-hidden">
        <p>Sidebar</p>
      </div>

      <div className="overflow-y-scroll flex-1">
        { children }
      </div>

    </div>
  </div>
}