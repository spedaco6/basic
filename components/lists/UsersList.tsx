"use client"

import { GetList } from "./GetList"
import { FetchResponseData } from "@/hooks/useFetch"
import { ProfileData } from "@/lib/server/api/profile"
import { ROLES } from "@/lib/server/const"
import { Button } from "../buttons/Button"
import { getAuthorizedProfiles } from "@/lib/client/api/profile"

interface UsersResponseData extends FetchResponseData {
  users: Partial<ProfileData>[]
}

export const UsersList = () => {

  return <GetList<UsersResponseData> fetch={getAuthorizedProfiles}>
    {(data) => {
      return <ul className="mt-6">
        <li className="grid grid-cols-[2fr_1fr_2fr_6rem] gap-2 font-bold">
          <span className="col-span-1 text-left">Email</span>
          <span className="col-span-1 text-left">Role</span>
          <span className="col-span-1 text-left">Name</span>
        </li>
        { data.users && data.users.map((user, i) => {
          const userRole = ROLES.find(role => role.permissions === user.role);
          return <li key={user.id} className={`${i%2 === 0 ? "bg-gray-100" : ""} grid grid-cols-[2fr_1fr_2fr_6rem] gap-2 p-2 items-center`}>
            <span className="col-span-1 text-left">{user.email}</span>
            <span className="col-span-1 text-left">{userRole?.role ?? "Unknown: " + user.role }</span>
            <span className="col-span-1 text-left">{user.firstName} {user.lastName}</span>
            <div className="flex gap-2 w-fit justify-end">
              <Button btnStyle="outline"><i className="bi bi-pen" /></Button>
              <Button btnStyle="outlineDanger"><i className="bi bi-trash" /></Button>
            </div>
          </li> 
        })}
      </ul>
    }}
  </GetList>
}