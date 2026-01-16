"use client"

import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import { getToken } from "@/lib/tokens";
import React, { useEffect } from "react"
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
  const { data, error, loading, refetch } = useFetch<ProfileResponseData>(getProfile, {});
  
  console.log("Data: ", data);

  useEffect(() => {
    if (Object.keys(data).length === 0 && !error && !loading) {
      refetch();
    }
  }, [refetch, data]);

  return <div>
    <h3>Profile Card</h3>
    { data && !error && !loading && <div>
      <p>{ data.firstName } {data.lastName }</p>
    </div> }
    { error && <p className="text-red-500">{ error }</p> }
    { loading && <LoadingProfileCard /> }
  </div>
}