"use client"

import { useInput } from "@/hooks/useInput";
import React, { FormEventHandler, useEffect, useState } from "react";
import { Input } from "../inputs/Input";
import { FetchResponseData, useFetch } from "@/hooks/useFetch";
import { changePassword } from "@/lib/client/api/profile";
import { Modal } from "../ui/Modal";

export const ChangePasswordButton = (): React.ReactNode => {
  const [ open, setOpen ] = useState(false);
  const { data, error, reset, refetch } = useFetch<
    FetchResponseData, 
    [string, string, string]
  >(changePassword, {}, { immediate: false });

  const currentPassword = useInput("currentPassword*", "");
  const newPassword = useInput("newPassword*", "");
  const confirmPassword = useInput("confirmPassword*", "");

  useEffect(() => {
    currentPassword.setValue("");
    newPassword.setValue("");
    confirmPassword.setValue("");
  }, [data])

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    refetch(currentPassword.value, newPassword.value, confirmPassword.value);
  }

  const handleCancel = () => {
    currentPassword.setValue("");
    newPassword.setValue("");
    confirmPassword.setValue("");
    setOpen(false);
    reset();
  }

  return <>
    <button 
      className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 rounded-sm px-4"
      onClick={() => setOpen(true)}>
        Change Password
    </button>
    <Modal open={open} className="min-w-fit w-[30rem] p-8">
      { !data.success && <form
        onSubmit={handleSubmit} 
        className="flex flex-col gap-2">
        <h2 className="text-2xl mb-4">Change Password:</h2>
        { error && <p className="text-red-500">{ error }</p> }
        { data.validationErrors && data.validationErrors.length > 0 && <ul>
          { data.validationErrors.map(e => <li key={e}>
            <p className="text-red-500 ml-4">{ e }</p>
          </li> )}
        </ul> }
        <Input hook={currentPassword} type="password" placeholder="Current Password" className="mb-4 bg-white" />
        <Input hook={newPassword} type="password" placeholder="New Password" className="bg-white" />
        <Input hook={confirmPassword} type="password" placeholder="Confirm Password" className="bg-white" />
        <div className="flex gap-4 justify-end">
          <button className="hover:border-black border-gray-200 transition-border duration-100 border-1 cursor-pointer py-2 rounded-sm px-4" type="button" onClick={handleCancel}>Cancel</button>
          <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 rounded-sm px-4">Submit</button>
        </div>
      </form> }

      { data.success && <div className="flex flex-col gap-8 justify-center min-h-[15rem]">
        <h2 className="text-2xl flex-1 flex justify-center items-center">Success!</h2>
        <div className="flex justify-end w-full">
          <button 
            className="hover:border-black border-gray-200 transition-border duration-100 border-1 cursor-pointer py-2 rounded-sm px-4" 
            onClick={handleCancel}>Close</button>
        </div>
      </div> }
    </Modal>
  </>
}