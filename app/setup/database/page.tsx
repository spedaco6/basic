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

  const users = await User.find({ or: { email: [
    "user@email.com",
    "customer@email.com",
    "employee@email.com", 
    "manager@email.com", 
    "admin@email.com"
  ]} });
  if (users && !users.length) {
    console.log("Setting up sample users...");
    const user = new User({
      firstName: "Lone",
      lastName: "User",
      email: "user@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
    });
    await user.save();
    const customer = new User({
      firstName: "Committed",
      lastName: "Customer",
      email: "customer@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 40,
    });
    await customer.save();
    const employee = new User({
      firstName: "Purely",
      lastName: "Ficticious",
      email: "employee@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 30,
    });
    await employee.save();
    const manager = new User({
      firstName: "Manager",
      lastName: "Man",
      email: "manager@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 20
    });
    await manager.save();
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
      <li className="ml-4">user@email.com</li>
      <li className="ml-4">customer@email.com</li>
      <li className="ml-4">employee@email.com</li>
      <li className="ml-4">manager@email.com</li>
      <li className="ml-4">admin@email.com</li>
    </ul>
  </div>
}