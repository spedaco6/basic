import { LogoutButton } from "@/components/buttons/LogoutButton";
import { Sidebar } from "@/components/nav/Sidebar";
import React from "react";

export default function AuthLayout({ children }: React.PropsWithChildren ): React.ReactElement {
  
  return <div className="flex flex-col h-[100dvh]">
    <div className="p-2 bg-gray-100 flex justify-end shadow-md">
      <LogoutButton />
    </div>
    
    <div className="flex-1 flex overflow-hidden">

      <div className="w-[16rem] h-full overflow-y-scroll shadow-xl">
        <Sidebar />
      </div>

      <div className="overflow-y-scroll flex-1">
        { children }
      </div>

    </div>
  </div>
}