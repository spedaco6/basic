"use client"

import { GetList } from "./GetList"
import { FetchResponseData } from "@/hooks/useFetch"
import { ProfileData } from "@/lib/server/api/profile"
import { getAuthorizedProfiles } from "@/lib/client/api/profile"
import { UsersListItem } from "./UsersListItem"
import { useRefreshContext } from "@/context/RefreshContext"

interface UsersResponseData extends FetchResponseData {
  users: Partial<ProfileData>[]
}

export const UsersList = () => {
  const { isFresh, refresh } = useRefreshContext();
  return <GetList<UsersResponseData> 
    fetch={getAuthorizedProfiles}
    fresh={isFresh}
    refresh={refresh}
  >
    {(data) => {
      return <ul className="mt-6">
        <li className="grid grid-cols-[2fr_1fr_2fr_6rem] gap-2 font-bold">
          <span className="col-span-1 text-left">Email</span>
          <span className="col-span-1 text-left">Role</span>
          <span className="col-span-1 text-left">Name</span>
        </li>
        { data.users && data.users.map((user, i) => <UsersListItem 
          key={user.id} 
          user={user}
          className={`${i%2 === 0 ? "bg-gray-100" : ""}`} 
        /> )}
      </ul>
    }}
  </GetList>
}