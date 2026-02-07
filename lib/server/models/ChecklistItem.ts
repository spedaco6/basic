import "server-only";
import { TableSchema } from "../database/Database";
import { getDb } from "../database/db";
import { Model } from "./Model";

interface IChecklistItem {
  title: string,
  complete: boolean,
  creatorId: number,
}

export class ChecklistItem extends Model {
  public title: string;
  public complete: boolean;
  public creatorId: number;

  public static tableName = "checklist_items";
  public static schema: TableSchema = [
    ...Model.schema,
    {
      name: "title",
      type: "text",
      required: true,
    }, {
      name: "complete",
      type: "bool",
      default: "false"
    }, {
      name: "creatorId",
      type: "number",
      required: true,
    }
  ];
  
  constructor(props: IChecklistItem) {
    super();
    Object.assign(this, props);
    this.title = props.title;
    this.complete = props.complete;
    this.creatorId = props.creatorId;
  }
}

// Ensure db is set
const db = getDb();
ChecklistItem.db = db;