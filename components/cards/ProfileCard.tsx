"use client"

import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import { getToken } from "@/lib/tokens";
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
      <p>{ data.firstName } {data.lastName }</p>
    </div> }
    { error && <p className="text-red-500">{ error }</p> }
    { loading && <div className="space-y-4">
      <LoadingProfileCard /> 
      <LoadingProfileCard /> 
      <LoadingProfileCard /> 
    </div> }
  </div>
}