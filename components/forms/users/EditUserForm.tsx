"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "@/components/inputs/Input";
import { ROLES } from "@/lib/server/const";
import { useToken } from "@/hooks/useToken";
import { Button } from "@/components/buttons/Button";
import React, { useEffect } from "react";
import { Select } from "@/components/inputs/Select";
import { useFetch } from "@/hooks/useFetch";
import { updatePermissions } from "@/lib/client/api/profile";
import { ProfileResponseData } from "@/app/api/profile/route";
import { ProfileData } from "@/lib/server/api/profile";
import { useRefreshContext } from "@/context/RefreshContext";

export const EditUserForm = (): React.ReactNode => {
  const { 
    data: patchData, 
    refetch: patchFetch 
  } = useFetch<ProfileResponseData, [Partial<ProfileData>]>(updatePermissions, {}, { immediate: false });
  
  const { callRefresh } = useRefreshContext();
  
  const email = useInput("email*", "");
  const password = useInput("password", "");
  const userRole = useInput("role", 50);

  // Send signal to context that refresh is required
  useEffect(() => {
    callRefresh();
  }, [patchData]);

  const { role } = useToken();
  const availableRoles = ROLES
    .filter(r => r.permissions >= role)
    .map(r => ({ name: r.role, value: r.permissions }))
    .sort((a, b) => a.value - b.value );

  const handleCancel = () => {
    email.setValue("");
    password.setValue("");
    userRole.setValue(50);
  }

  const handleSubmit = () => {
    patchFetch({
      email: email.value,
      role: userRole.value,
      password: password.value,
    });
    email.setValue("");
    password.setValue("");
    userRole.setValue(50);
  }

  return <div className="flex flex-wrap gap-4 rounded-md">
    <div className="flex gap-2 flex-1">
      <Select className="bg-gray-100" hook={userRole} options={availableRoles} label="User role" />
      <Input className="bg-gray-100" hook={email} type="email" label="Email" />
    </div>
    <div className="flex gap-2 items-end flex-1">
      <Input className="bg-gray-100" hook={password} type="password" label="Temporary Password" />
      <Button onClick={handleSubmit} btnStyle="accept"><i className="bi bi-save" /></Button>
      <Button onClick={handleCancel} btnStyle="outlineDanger"><i className="bi bi-trash" /></Button>
    </div>
  </div>
}