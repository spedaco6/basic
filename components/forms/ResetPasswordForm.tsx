"use client"

import { useInput } from "@/hooks/useInput"
import { Input } from "../inputs/Input";
import { Button } from "../buttons/Button";
import { FormEvent, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";

const resetPassword = async (
  newPassword: string, 
  confirmPassword: string, 
  resetToken: string
) => {
  console.log("HERE");
  return fetch("/api/profile/password/reset", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + resetToken,
    },
    body: JSON.stringify({
      newPassword,
      confirmPassword,
    }),
  })
};

export const ResetPasswordForm = ({ 
  token 
}: {
  token: string
}) => {
  const newPassword = useInput("newPassword*", "");
  const confirmPassword = useInput("confirmPassword*", "");
  const { refetch, error, loading, data } = useFetch(resetPassword, {}, { immediate: false });

  useEffect(() => {
    newPassword.setValue("");
    confirmPassword.setValue("");
  }, [data])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    refetch(newPassword.value, confirmPassword.value, token);
  };

  return <>
    { data && data.success && <p>Success!</p> }
    { !data || (data && !data.success) && <form
      onSubmit={handleSubmit} 
      className="flex flex-col gap-2 w-120 bg-gray-100 p-4 rounded-md m-4">
      <h2 className="text-2xl mb-4">Change Password:</h2>
      { error && <p className="text-red-500">{ error }</p> }
      { data.validationErrors && data.validationErrors.length > 0 && <ul>
        { data.validationErrors.map(e => <li key={e}>
          <p className="text-red-500 ml-4">{ e }</p>
        </li> )}
      </ul> }
      <Input hook={newPassword} type="password" placeholder="New Password" className="bg-white" />
      <Input hook={confirmPassword} type="password" placeholder="Confirm Password" className="bg-white" />
      <div className="flex gap-4 justify-end mt-4">
        <Button>Submit</Button>
      </div>
    </form>}
  </>

}