"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "../inputs/Input";
import { ROLES } from "@/lib/server/const";
import { useToken } from "@/hooks/useToken";
import { Button } from "../buttons/Button";
import React from "react";

export const EditUserForm = (): React.ReactNode => {
  const email = useInput("email*", "");
  const password = useInput("password*", "");
  const userRole = useInput("role", "");

  const { role } = useToken();
  const availableRoles = ROLES
    .filter(r => r.permissions >= role)
    .sort((a, b) => b.permissions - a.permissions );

  return <div className="bg-gray-200 p-4 m-4 flex flex-wrap gap-4 rounded-md">
    <div className="flex-3 flex flex-wrap gap-2">
      <div className="flex flex-col">
        <label className="uppercase text-xs p-1">User Role:</label>
        <select name="role" className="bg-white rounded-md p-1">
          { availableRoles && availableRoles.map(r => <option
            key={r.permissions}
            value={r.permissions}
            > 
            { r.role }
          </option>)}
        </select>
      </div>
      <Input className="bg-white" hook={email} type="email" label="Email" />
      <Input className="bg-white" hook={password} type="password" label="Temporary Password" />
    </div>
    <div className="flex flex-1 flex-col justify-center gap-2">
      <Button>Add User</Button>
      <Button btnStyle="outline">Cancel</Button>
    </div>
  </div>
}