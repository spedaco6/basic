"use client"

import { useSidebarCtx } from "@/context/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const SidebarLink = ({ 
  href, 
  children 
}: React.PropsWithChildren & { href: string }): React.ReactElement => {
  const pathname = usePathname();
  const { close } = useSidebarCtx();
  const css = `py-1 ${ pathname === href ? 
    "bg-gray-200 text-gray-800" : 
    "hover:bg-gray-200 hover:text-gray-800" }`;

  return <li className={ css }>
    <Link className="flex w-full px-4 items-center" href={href} onClick={close}>
      { children }
    </Link>
  </li>

}