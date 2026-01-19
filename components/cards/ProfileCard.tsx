"use client"

import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import { getToken } from "@/lib/client/tokens";
import React from "react"
import { LoadingProfileCard } from "./LoadingProfileCard";

const getProfile = async (): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
}

export const ProfileCard = (): React.ReactElement => {
  const { data, error, loading } = useFetch<ProfileResponseData>(getProfile);

  return <div>
    { data && !error && !loading && <div>
      <div className="flex justify-between w-[40rem] items-center">
        <p className="text-lg">Email: { data.email }</p>
        <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm">Edit</button>
      </div>
    </div> }
    { error && <p className="text-red-500">{ error }</p> }
    { loading && <div className="space-y-4">
      <LoadingProfileCard /> 
      <LoadingProfileCard /> 
      <LoadingProfileCard /> 
    </div> }
  </div>
}