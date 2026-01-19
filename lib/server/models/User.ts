import { Model } from "./Model";
import type { TableSchema } from "../database/Database";
import { getDb } from "../database/db";
import "server-only";

interface IUser {
  id?: number,
  email?: string,
  password?: string,
  role?: number,
  firstName?: string,
  lastName?: string,
  jti?: string,
}

export class User extends Model implements IUser {
  protected static schema: TableSchema = [
    {
      name: 'email',
      type: 'TEXT',
      required: true,
      unique: true,
    },
    { 
      name: 'password',
      type: "TEXT",
      required: true,
    },
    { 
      name: "role",
      type: "INT",
      required: true,
      default: 30,
    }, {
      name: "firstName",
      type: "TEXT",
    }, {
      name: "lastName",
      type: "TEXT",
    }, {
      name: "jti",
      type: "string",
    }
  ];
  
  public email?: string;
  public password?: string; // todo remove sensitive fields like this
  public role?: number;
  public firstName?: string;
  public lastName?: string;
  public jti?: string;

  constructor(props: Record<string, any>) {
    super();
    Object.assign(this, props);
  }
}
const db = getDb();
await User.init(db);

// todo delete this setup
const users = await User.findOne({ or: { email: ["email@email.com", "admin@email.com"]} });
if (!users) {
  console.log("Setting up sample users...");
  const user = new User({
    firstName: "Purely",
    lastName: "Ficticious",
    email: "email@email.com",
    password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6"
  });
  await user.save();
  const admin = new User({
    firstName: "Admin",
    lastName: "User",
    email: "admin@email.com",
    password: "$2b$10$wjJfTLNsZqnGEh29SpuL8OWUhghSUDwINncj0wnzbp5f9KCbZhfP6",
    role: 10
  });
  await admin.save();
}