import { HTTPError } from "../errors"
import { User } from "../models/User";
import { verifyAccessToken } from "../tokens";

// DO NOT USE ERROR HANDLING
// HTTP ERRORS WILL BE HANDLED IN API ROUTES

const users = [
    {
      firstName: "Lone",
      lastName: "User",
      email: "user@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
    }, {
      firstName: "Committed",
      lastName: "Customer",
      email: "customer@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 40,
    }, {
      firstName: "Purely",
      lastName: "Ficticious",
      email: "employee@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 30,  
    }, {
      firstName: "Manager",
      lastName: "Man",
      email: "manager@email.com",
      password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
      role: 20
    }
  ];

export const createTestUsers = async (accessToken: string) => {
  if (!accessToken) throw new HTTPError("No access token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Unverified access token", 401);

  const emails = users.map(user => user.email);

  for (const email of emails) {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) continue;
    const userData = users.find(user => user.email === email);
    if (!userData) continue;
    const newUser = new User(userData);
    await newUser.save();
  }
}

export const deleteTestUsers = async (accessToken: string) => {
  if (!accessToken) throw new HTTPError("No access token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Unverified access token", 401);

  const emails = users.map(user => user.email);

  for (const email of emails) {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) await existingUser.delete();
  }
}