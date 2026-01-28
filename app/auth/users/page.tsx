import React from "react";
import { Metadata } from "next";
import { EditUserForm } from "@/components/forms/users/EditUserForm";
import { UsersList } from "@/components/lists/UsersList";

export const metadata: Metadata = {
  title: "Manage Users",
};

export default function UsersPage(): React.ReactElement {

  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Manage Users</h1>
    <EditUserForm />

    <h1 className="text-xl mt-12 uppercase">Authorized Users</h1>
    <UsersList />
  </main>
}