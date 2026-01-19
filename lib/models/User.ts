import { Model } from "./Model";
import type { TableSchema } from "../database/Database";
import { getDb } from "../database/db";

interface IUser {
  id?: number,
  email?: string,
  password?: string,
  role?: number,
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
    }
  ];
  
  public email?: string;
  public password?: string; // todo remove sensitive fields like this
  public role?: number;

  constructor(props: Record<string, any>) {
    super();
    Object.assign(this, props);
  }
}
const db = getDb();
await User.init(db);