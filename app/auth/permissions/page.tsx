import React from "react";
import { Metadata } from "next";
import { EditUserForm } from "@/components/forms/users/EditUserForm";
import { UsersList } from "@/components/lists/UsersList";
import { RefreshContextProvider } from "@/context/RefreshContext";

export const metadata: Metadata = {
  title: "Manage User Permissions",
};

export default function PermissionsPage(): React.ReactElement {

  return <main className="p-4">
    <RefreshContextProvider>
      <h1 className="text-2xl mb-4 uppercase">Manage Users</h1>

      <h2 className="text-xl mt-12 uppercase">Create Authorized User</h2>
      <EditUserForm />

      <h2 className="text-xl mt-12 uppercase">Edit User Permissions</h2>
      <UsersList />
    </RefreshContextProvider>
  </main>
}