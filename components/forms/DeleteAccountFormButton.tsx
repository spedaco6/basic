"use client"

import React, { FormEventHandler, useEffect, useState } from "react"
import { Modal } from "../ui/Modal";
import { Input } from "../inputs/Input";
import { useInput } from "@/hooks/useInput";
import { useFetch } from "@/hooks/useFetch";
import { deleteToken, getToken } from "@/lib/client/tokens";
import { useRouter } from "next/navigation";


const deleteAccount = async (password: string) => {
  const token = await getToken();
  return fetch("/api/profile", {
    method: "delete",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password }),
  });
}

export const DeleteAccountFormButton = (): React.ReactNode => {
  const [open, setOpen] = useState(false);
  const password = useInput("password", "");
  const { data, error, refetch, reset } = useFetch(deleteAccount, {}, { immediate: false });
  const router = useRouter();

  useEffect(() => {
    password.setValue("");
    if (data.success) {
      deleteToken();
      router.push("/login");
    }
  }, [data]);

  const handleCancel = () => {
    setOpen(false);
    reset();
    password.setValue("");
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    refetch(password.value);
  }

  return <div>
    <button 
      className="border bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm"
      onClick={() => setOpen(true)}>
        Delete Account
    </button>
    <Modal open={open}>
      <form onSubmit={onSubmit} className="p-4">
        <h2 className="text-xl font-bold">Are you sure?</h2>
        <p>Once an account has been deleted, it cannot be undone.</p>
        <p>Enter your password to continue...</p>
        { error && <p className="text-red-500">{ error }</p> }
        <Input hook={password} placeholder="Password" type="password" className="bg-white my-4" />
        <div className="flex gap-4 justify-end">
          <button className="hover:border-black border-gray-200 transition-border duration-100 border cursor-pointer py-2 rounded-sm px-4" type="button" onClick={handleCancel}>Cancel</button>
          <button className="border bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 rounded-sm px-4">Submit</button>
        </div>
      </form>
    </Modal>
  </div>
}