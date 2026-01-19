import { Model } from "./Model";
import type { TableSchema } from "../database/Database";
import { getDb } from "../database/db";

export class User extends Model {
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
      name: "userRole",
      type: "INT",
      required: true,
      default: 30,
    }
  ];
  
  public email?: string;
  public password?: string; // todo remove sensitive fields like this
  public userRole?: number;

  constructor(props: Record<string, any>) {
    super();
    Object.assign(this, props);
  }
}
const db = getDb();
await User.init(db);