import { LogoutButton } from "@/components/buttons/LogoutButton";
import { MenuButton } from "@/components/buttons/MenuButton";
import { Sidebar } from "@/components/nav/Sidebar";
import { Backdrop } from "@/components/ui/Backdrop";
import { SidebarContextProvider } from "@/context/SidebarContext";
import React from "react";

export default function AuthLayout({ children }: React.PropsWithChildren ): React.ReactElement {
  
  return <SidebarContextProvider>
    <div className="flex flex-col h-[100dvh]">
      <div className="bg-gray-100 flex justify-between items-center shadow-md pl-2">
        <div className="flex items-center">
          <MenuButton />
          <h2 className="font-bold ml-4 text-xl text-gray-500 italic">SPEDACO</h2>
        </div>
        <LogoutButton />
      </div>
      
      <div className="flex-1 flex overflow-hidden">

        <Sidebar />
        <Backdrop />

        <div className="overflow-y-scroll flex-1">
          { children }
        </div>

      </div>
    </div>
  </SidebarContextProvider>
}