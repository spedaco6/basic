"use client"

import React, { useEffect, useState } from "react"
import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import { LoadingProfileCard } from "./LoadingProfileCard";
import { ProfileData } from "@/lib/server/api/profile";
import { useInput } from "@/hooks/useInput";
import { putProfile, getProfile } from "@/lib/client/api/profile";
import { Input } from "../inputs/Input";

export const EditableProfileCard = (): React.ReactElement => {
  const { data: { profile }, error: errorGET, loading, refetch } = useFetch<ProfileResponseData>(getProfile);
  const put = useFetch<ProfileResponseData, [Partial<ProfileData>]>(putProfile, {}, { immediate: false });

  const isLoading = loading || put.loading;
  
  const [ edit, setEdit ] = useState(false);
  const [ canceled, setCanceled ] = useState(false);

  const email = useInput("email", "");
  const firstName = useInput("firstName", "");
  const lastName = useInput("lastName", "");

  // Update local state with each GET response
  useEffect(() => {
    if (profile?.email) email.setValue(profile.email);
    if (profile?.firstName) firstName.setValue(profile.firstName);
    if (profile?.lastName) lastName.setValue(profile.lastName);
  }, [profile]);

  // Send new GET request upon PUT response
  useEffect(() => {
    if (put.data.profile) refetch();
    if (put.error) {
      if (profile?.email) email.setValue(profile.email);
      if (profile?.firstName) firstName.setValue(profile.firstName);
      if (profile?.lastName) lastName.setValue(profile.lastName);
    }
  }, [put.data, put.error]);

  // Handle click event
  const onClick = () => {
    if (!edit) {
      setCanceled(false);
      put.clearError();
    } else {
      const args = { email: email.value, firstName: firstName.value, lastName: lastName.value };
      put.refetch(args);
    }
    setEdit(prev => !prev);
  }

  // Handle cancel event
  const onCancel = () => {
    setCanceled(true);
    setEdit(false);
    if (profile?.email) email.setValue(profile.email);
    if (profile?.firstName) firstName.setValue(profile.firstName);
    if (profile?.lastName) lastName.setValue(profile.lastName);
  }

  return <div className="max-w-[50rem]">
    <div className="flex justify-between w-full items-start">
      <div className="flex flex-col">

        { !edit && profile && !errorGET && <div>
          <p className="text-lg">{ firstName.value } { lastName.value }</p>
          <p className="text-lg">{ email.value }</p>
        </div> }

        { edit && profile && !errorGET && <div>
          <div className="flex gap-2">
            <Input hook={firstName} label="First Name"/>
            <Input hook={lastName} label="Last Name" />
          </div>
          <Input hook={email} label="Email" />
        </div> }

        { errorGET && <p className="text-red-500">{ errorGET }</p> } 
        { put.error && <p className="text-red-500">{ put.error }</p> }

       </div>

      { profile && <div className="flex gap-4 items-center">
        { edit && <button onClick={onCancel}>Cancel</button> }
        <button 
          disabled={isLoading}
          className={`${isLoading ? "bg-gray-400" : "bg-gray-700 hover:bg-gray-500"} flex items-center gap-2 text-white cursor-pointer h-fit py-2 px-4 rounded-sm`}
          onClick={onClick}
        >
          { edit ? "Save" : "Edit"}
          { isLoading && <div className="animate-spin w-fit"><i className="bi bi-arrow-repeat text-xl" /></div> }
          { put.data.success && !isLoading && !canceled && !edit && <i className="bi bi-check text-2xl" /> }
          { put.error && !isLoading && !canceled && !edit && <i className="bi bi-exclamation-circle text-xl" /> }
        </button>
      </div> }
    </div>

    { isLoading && !profile && <div className="space-y-4">
      <LoadingProfileCard /> 
    </div> }
  </div>
}