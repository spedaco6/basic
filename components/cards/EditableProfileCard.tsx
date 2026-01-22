"use client"

import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import React, { useEffect, useState } from "react"
import { LoadingProfileCard } from "./LoadingProfileCard";
import { ProfileData } from "@/lib/server/api/profile";
import { useInput } from "@/hooks/useInput";
import { putProfile, getProfile } from "@/lib/client/api/profile";
import { Input } from "../inputs/Input";

export const EditableProfileCard = (): React.ReactElement => {
  const { data: { profile }, error, loading, refetch } = useFetch<ProfileResponseData>(getProfile);
  const put = useFetch<ProfileResponseData, [Partial<ProfileData>]>(putProfile, {}, { immediate: false });

  const isLoading = loading || put.loading;
  
  const [ edit, setEdit ] = useState(false);
  const [ canceled, setCanceled ] = useState(false);

  const email = useInput("email", "");
  const firstName = useInput("firstName", "");
  const lastName = useInput("lastName", "");

  useEffect(() => {
    if (profile?.email) email.setValue(profile.email);
    if (profile?.firstName) firstName.setValue(profile.firstName);
    if (profile?.lastName) lastName.setValue(profile.lastName);
  }, [profile]);

  useEffect(() => {
    refetch();
  }, [put.data]);

  const onClick = () => {
    if (!edit) {
      setCanceled(false);
    } else {
      const args = { email: email.value, firstName: firstName.value, lastName: lastName.value };
      put.refetch(args);
    }
    setEdit(prev => !prev);
  }

  const onCancel = () => {
    setCanceled(true);
    setEdit(false);
  }

  return <div>
    { error && <p className="text-red-500">{ error }</p> }
    <div className="flex justify-between w-full">
      { !edit && profile && !error && <div>
        <p className="text-lg">{ firstName.value } { lastName.value }</p>
        <p className="text-lg">{ email.value }</p>
      </div> }

      { edit && profile && !error && <div>
        <div className="flex gap-2">
          <Input hook={firstName} label="First Name"/>
          <Input hook={lastName} label="Last Name" />
        </div>
        <Input hook={email} label="Email" />
      </div> }
      
      { profile && <div className="flex gap-4 items-center">
        { edit && <button onClick={onCancel}>Cancel</button> }
        <button 
          className="bg-gray-700 flex items-center gap-2 hover:bg-gray-500 text-white cursor-pointer h-fit py-2 px-4 rounded-sm"
          onClick={onClick}
        >
          { edit ? "Save" : "Edit"}
          { isLoading && <div className="animate-spin w-fit"><i className="bi bi-arrow-clockwise text-xl" /></div> }
          { put.data.success && !isLoading && !canceled && !edit && <i className="bi bi-check text-2xl" /> }
        </button>
      </div> }
    </div>

    { isLoading && !profile && <div className="space-y-4">
      <LoadingProfileCard /> 
    </div> }
  </div>
}