"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "../inputs/Input";
import { ROLES } from "@/lib/server/const";
import { useToken } from "@/hooks/useToken";
import { Button } from "../buttons/Button";
import React from "react";
import { Select } from "../inputs/Select";

export const EditUserForm = (): React.ReactNode => {
  const email = useInput("email*", "");
  const password = useInput("password", "");
  const userRole = useInput("role", 50);

  const { role } = useToken();
  const availableRoles = ROLES
    .filter(r => r.permissions >= role)
    .map(r => ({ name: r.role, value: r.permissions }))
    .sort((a, b) => a.value - b.value );

  return <div className="flex flex-wrap gap-4 rounded-md">
    <div className="flex gap-2 flex-1">
      <Select className="bg-gray-100" hook={userRole} options={availableRoles} label="User role" />
      <Input className="bg-gray-100" hook={email} type="email" label="Email" />
    </div>
    <div className="flex gap-2 items-end flex-1">
      <Input className="bg-gray-100" hook={password} type="password" label="Temporary Password" />
      <Button btnStyle="accept"><i className="bi bi-save" /></Button>
      <Button btnStyle="outlineDanger"><i className="bi bi-trash" /></Button>
    </div>
  </div>
}