"use client"

import React, { useEffect, useState } from "react";
import { Button } from "../buttons/Button";
import { useFetch } from "@/hooks/useFetch";
import { revokePermissions, updatePermissions } from "@/lib/client/api/profile";
import { ROLES } from "@/lib/server/const";
import { ProfileData } from "@/lib/server/api/profile";
import { useInput } from "@/hooks/useInput";
import { ProfileResponseData } from "@/app/api/profile/route";
import { Select } from "../inputs/Select";
import { useToken } from "@/hooks/useToken";
import { useRefreshContext } from "@/context/RefreshContext";

export const UsersListItem = ({ user, className="", ...props }: { user: Partial<ProfileData>, className: string }): React.ReactNode => {
  const { data, refetch } = useFetch<ProfileResponseData, [number | undefined]>(revokePermissions, {}, { immediate: false });
  const update = useFetch<ProfileResponseData, [Partial<ProfileData>]>(updatePermissions, {}, { immediate: false });
  const [ edit, setEdit ] = useState(false);
  const role = useInput("role", user.role);
  const { role: userRole } = useToken();
  const { callRefresh } = useRefreshContext();

  // Runs each time permissions are revoked
  useEffect(() => {
    if (data.profile) {
      role.setValue(data.profile.userRole);
    }
    if (data && data.success) callRefresh();
  }, [data]);

  // Runs each time permissions are updated
  useEffect(() => {
    if (update.data && update.data.success) callRefresh();
  }, [update.data]);

  const roleInfo = ROLES.find(r => r.permissions === role.value);
  const options = ROLES
    .filter(r => r.permissions >= userRole)
    .map(r => ({ name: r.role, value: r.permissions }));

  const handleClick = () => {
    if (edit) update.refetch({ role: role.value, email: user.email });
    setEdit(prev => !prev);
  }

  return <li className={`${className} grid grid-cols-[2fr_1fr_2fr_6rem] gap-2 p-2 items-center`} {...props}>
    <span className="col-span-1 text-left">{user.email}</span>
    { edit ?
      <Select hook={role} options={options} /> : 
      <span className="col-span-1 text-left">{roleInfo?.role ?? "Unknown: " + user.role }</span>}
    <span className="col-span-1 text-left">{user.firstName} {user.lastName}</span>
    <div className="flex gap-2 w-fit justify-end">
      <Button onClick={handleClick} btnStyle={edit ? "accept" : "outline"}>
        { edit ? <i className="bi bi-save" /> : <i className="bi bi-pen" />}
      </Button>
      <Button onClick={() => refetch(user.id)} btnStyle="outlineDanger"><i className="bi bi-trash" /></Button>
    </div>
  </li>
}