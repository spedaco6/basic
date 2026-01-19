"use client"

import { TokenPayload } from "@/lib/client/tokens";
import { decodeJwt } from "jose";
import { useEffect, useState } from "react"

export const useToken = () => {
  const [ payload, setPayload ] = useState<TokenPayload>({ userRole: 50, userId: 0 });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { userId, userRole } = decodeJwt<TokenPayload>(token);
      setPayload({ userId, userRole });
    }
  }, []);
  return {
    role: payload.userRole,
    id: payload.userId,
  }; 
}