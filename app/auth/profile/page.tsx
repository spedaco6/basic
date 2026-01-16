import { ProfileCard } from "@/components/cards/ProfileCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage(): React.ReactElement {

  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Profile</h1>
    <ProfileCard />
  </main>
}