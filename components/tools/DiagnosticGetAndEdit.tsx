"use client"

import React, { useEffect, useState } from "react"
import { ProfileResponseData } from "@/app/api/profile/route";
import { useFetch } from "@/hooks/useFetch"
import { LoadingProfileCard } from "../cards/LoadingProfileCard";
import { ProfileData } from "@/lib/server/api/profile";
import { useInput } from "@/hooks/useInput";
import { Input } from "../inputs/Input";
import { getProfile } from "@/lib/client/api/profile";

const getFetch = () => fetch("/api/test/error");
const putFetch = () => fetch("/api/test/error", { 
  method: "put", 
  headers: {
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ dummy: "data" }),
});

export const DiagnosticGetAndEdit = (): React.ReactElement => {
  const { data, error: errorGET, loading, refetch } = useFetch<ProfileResponseData>(getProfile);
  const put = useFetch<ProfileResponseData, [Partial<ProfileData>]>(putFetch, {}, { immediate: false });

  const isLoading = loading || put.loading;
  
  const [ edit, setEdit ] = useState(false);
  const [ canceled, setCanceled ] = useState(false);

  console.log(data);

  const email = useInput("email", "");
  const firstName = useInput("firstName", "");
  const lastName = useInput("lastName", "");

  // Update local state with each GET response
  useEffect(() => {
    if (data?.profile?.email) email.setValue(data.profile.email);
    if (data?.profile?.firstName) firstName.setValue(data.profile.firstName);
    if (data?.profile?.lastName) lastName.setValue(data.profile.lastName);
  }, [data.profile]);

  // Send new GET request upon PUT response
  useEffect(() => {
    if (put.data.profile) refetch();
    if (put.error) {
      if (data.profile?.email) email.setValue(data.profile.email);
      if (data.profile?.firstName) firstName.setValue(data.profile.firstName);
      if (data.profile?.lastName) lastName.setValue(data.profile.lastName);
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
    if (data.profile?.email) email.setValue(data.profile.email);
    if (data.profile?.firstName) firstName.setValue(data.profile.firstName);
    if (data.profile?.lastName) lastName.setValue(data.profile.lastName);
  }

  return <div className="mt-4">
    <div className="flex justify-between w-full items-start">
      <div className="flex flex-col">

        { !edit && data.profile && !errorGET && <div>
          <p className="text-lg">{ firstName.value } { lastName.value }</p>
          <p className="text-lg">{ email.value }</p>
        </div> }

        { edit && data.profile && !errorGET && <div>
          <div className="flex gap-2">
            <Input hook={firstName} label="First Name"/>
            <Input hook={lastName} label="Last Name" />
          </div>
          <Input hook={email} label="Email" />
        </div> }

        { errorGET && <p className="text-red-500">{ errorGET }</p> } 
        { put.error && <p className="text-red-500">{ put.error }</p> }

       </div>

      { data.profile && <div className="flex gap-4 items-center">
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

    { isLoading && !data.profile && <div className="space-y-4">
      <LoadingProfileCard /> 
    </div> }
  </div>
}