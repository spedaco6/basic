import { getDb } from "@/lib/server/database/db";
import { User } from "@/lib/server/models/User";
import { redirect } from "next/navigation";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const url_setup_key = (await searchParams).setup_key;
  const setup_key = process.env.SETUP_KEY;
  if (!setup_key || setup_key !== url_setup_key) return redirect("/login");

  const db = getDb();
  await User.init(db);

  const user = await User.findOne({ email: "admin@email.com" });
  if (!user) {
    console.log("Setting up sample user...");
    const admin = new User({
      firstName: "Admin",
      lastName: "Access",
      email: "admin@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 10
    });
    await admin.save();
  }

  return <div className="p-2">
    <p>Successfully initialized users table!</p>

    <p>Successfullly set up users:</p>
    <ul>
      <li className="ml-4">admin@email.com</li>
    </ul>
  </div>
}