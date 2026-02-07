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
  resetToken?: string,
}

export class User extends Model implements IUser {
  public static tableName = "users";
  public static schema: TableSchema = [
    ...Model.schema,
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
      default: 50,
    }, {
      name: "firstName",
      type: "TEXT",
    }, {
      name: "lastName",
      type: "TEXT",
    }, {
      name: "jti",
      type: "string",
    }, {
      name: "resetToken",
      type: "string",
    }
  ];
  
  public email?: string;
  public password?: string;
  public role?: number;
  public firstName?: string;
  public lastName?: string;
  public jti?: string;
  public resetToken?: string;

  constructor(props: IUser) {
    super();
    Object.assign(this, props);
  }
}

// Ensure User.db is set
/* const db = getDb();
User.db = db; */