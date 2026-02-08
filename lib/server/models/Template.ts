import { Model } from "./Model";

interface IChild { // todo rename interface
  custom: string; // todo update custom fields
}

class Child extends Model { // todo rename class
  public custom?: string; // todo update custom fields
  
  static tableName = "child"; // todo update table name
  static schema = [
    ...Model.schema,
    { name: "custom", type: "string" }, // todo update schema for custom fields
  ];

  constructor(props: IChild) { // todo update props type
    super();
    Object.assign(this, props);
  }
}