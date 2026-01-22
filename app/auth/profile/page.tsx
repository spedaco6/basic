import { EditableProfileCard } from "@/components/cards/EditableProfileCard";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage(): React.ReactElement {

  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Profile</h1>
    <h2 className="mt-12 mb-6 text-xl uppercase shadow-lg">Account Details</h2>
    <EditableProfileCard />
    {/* <ProfileCard /> */}
    <h2 className="mt-12 mb-6 text-xl uppercase shadow-lg">Account Security</h2>
    <div>
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm">Change Password</button>
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm">Logout of all devices</button>
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm">Verify Email</button>
    </div>
    <h2 className="mt-12 mb-6 text-xl uppercase shadow-lg">Account Options</h2>
      <button className="border-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer py-2 px-4 rounded-sm">Delete Account</button>
  </main>
}