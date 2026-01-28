"use client"

import React, { FormEventHandler, useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/inputs/Input";
import { useInput } from "@/hooks/useInput";
import { useFetch } from "@/hooks/useFetch";
import { deleteToken, getToken } from "@/lib/client/tokens";
import { useRouter } from "next/navigation";
import { Button } from "@/components/buttons/Button";


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
    <Button 
      btnStyle="outlineDanger"
      onClick={() => setOpen(true)}>
        Delete Account
    </Button>
    <Modal open={open}>
      <form onSubmit={onSubmit} className="p-4">
        <h2 className="text-xl font-bold">Are you sure?</h2>
        <p>Once an account has been deleted, it cannot be undone.</p>
        <p>Enter your password to continue...</p>
        { error && <p className="text-red-500">{ error }</p> }
        <Input hook={password} placeholder="Password" type="password" className="bg-white my-4" />
        <div className="flex gap-4 justify-end">
          <Button btnStyle="flat" type="button" onClick={handleCancel}>Cancel</Button>
          <Button btnStyle="danger">Submit</Button>
        </div>
      </form>
    </Modal>
  </div>
}