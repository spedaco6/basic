import { LogoutButton } from "@/components/buttons/LogoutButton";
import { MenuButton } from "@/components/buttons/MenuButton";
import { Sidebar } from "@/components/nav/Sidebar";
import React from "react";

export default function AuthLayout({ children }: React.PropsWithChildren ): React.ReactElement {
  
  return <div className="flex flex-col h-[100dvh] p-2">
    <div className="bg-gray-100 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <MenuButton />
        <h2 className="font-bold ml-4 text-xl text-gray-500 italic">SPEDACO</h2>
      </div>
      <LogoutButton />
    </div>
    
    <div className="flex-1 flex overflow-hidden">

      <div className="w-[16rem] h-full overflow-y-scroll shadow-xl hidden md:block">
        <Sidebar />
      </div>

      <div className="overflow-y-scroll flex-1">
        { children }
      </div>

    </div>
  </div>
}