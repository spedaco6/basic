"use client"

import { useInput } from "@/hooks/useInput";
import React, { FormEventHandler } from "react";
import { Input } from "../inputs/Input";
import { getToken } from "@/lib/client/tokens";
import { FetchResponseData, useFetch } from "@/hooks/useFetch";

const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
  const token = await getToken();
  return fetch("/api/profile/password/change", {
    method: "put",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    })
  });
}

export const ChangePasswordForm = ({ onCancel }: { onCancel?: () => void }): React.ReactNode => {
  const { data, error, loading, refetch } = useFetch<
    FetchResponseData, 
    [string, string, string]
  >(changePassword, {}, { immediate: false });

  const currentPassword = useInput("currentPassword*", "");
  const newPassword = useInput("newPassword*", "");
  const confirmPassword = useInput("confirmPassword*", "");

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    refetch(currentPassword.value, newPassword.value, confirmPassword.value);
    currentPassword.setValue("");
    newPassword.setValue("");
    confirmPassword.setValue("");
  }

  const handleCancel = () => {
    currentPassword.setValue("");
    newPassword.setValue("");
    confirmPassword.setValue("");
    if (onCancel) {
      onCancel();
    }
  }

  return <form onSubmit={handleSubmit} className="max-w-[20rem] flex flex-col gap-2">
    <Input hook={currentPassword} type="password" placeholder="Current Password" />
    <Input hook={newPassword} type="password" placeholder="New Password" />
    <Input hook={confirmPassword} type="password" placeholder="Confirm Password" />
    <div className="flex gap-2 justify-end">
      { onCancel && <button onClick={handleCancel}>Cancel</button> }
      <button>Submit</button>
    </div>
  </form>
}