import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function UsersPage(): React.ReactElement {

  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Manage Users</h1>
  </main>
}