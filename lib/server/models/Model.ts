import type { Database, QueryOptions, TableSchema } from "../database/Database";
import { nanoid } from "nanoid";
import { getDb } from "../database/db";
import "server-only";

type ModelClass<T extends Model> = {
  new (...args: any[]): T;
  db: Database;
  tableName: string;
  schema: TableSchema;
}

export abstract class Model {
  protected static schema: TableSchema = [
    { name: "id", type: "int", primaryKey: true },
    { name: "secureKey", type: "text", required: true, unique: true },
    { name: "created_at", type: "timestamp_create" },
    { name: "updated_at", type: "timestamp_update" },
  ];  

  // Default properties
  public id?: number;
  public secureKey?: string;
  public created_at?: string;
  public updated_at?: string;
  static db: Database;

  constructor() {}

  // find records by criteria
  static async find<T extends Model>(
    this: ModelClass<T>,
    filters: Record<string, any>,
    options: Partial<QueryOptions> ={},
    ...returnFields: string[]
  ): Promise<T[] | null> {
    const models = await this.db.find<T>(this.tableName, filters, options, ...returnFields);
    return models;
  }

  // find record by id
  static async findById<T extends Model>(
    // This is defined as a class that creates an instance of Model
    // and contains a db property and getTableName() method
    this: ModelClass<T>,
    id?: number | null,
    ...returnFields: string[]
  ): Promise<InstanceType<typeof this> | null | Record<string, any>> { // typeof this because this is a constructor
    if (!id) throw new Error("No id provided");
    const data = await this.db.find(this.tableName, { id }, {}, ...returnFields);
    const model = data.length ? data[0] : null;
    // If specific fields are requested, return a plain object of requested fields
    if (returnFields.length) return model;
    // No specific return fields, return instance of Model
    return model ? new this(model) : model;
  }

  static async findOne<T extends Model>(
    this: ModelClass<T>,
    filters: Record<string, any>,
    ...returnFields: string[]
  ): Promise<InstanceType<typeof this> | null | Record<string, any>> {
    const data = await this.db.find(this.tableName, filters, { limit: 1 }, ...returnFields);
    const model = data.length ? data[0] : null;
    if (returnFields.length) return model as Record<string, any>;
    return model ? new this(model) : model;
  }

  // Save new or update existing Model subclass
  public async save(): Promise<this> {
    // Save model to database
    let saved = null;
    if (!this.id) {
      // add secure id locally if it doesn't already exist
      this.secureKey = this.secureKey ?? nanoid();
      saved = await this.db.createOne(this.tableName, this);
      // If initial save fails, remove secure key
      if (!saved) this.secureKey = undefined;
    } else {
      saved = await this.db.updateOne(this.tableName, this);
    }

    if (!saved) throw new Error("Could not save model");

    // Update local model
    Object.assign(this, saved);
    return this;
  }

  // deletes user from the database
  public async delete(): Promise<void> {
    if (!this.id) throw new Error("No id provided for deletion");
    await this.db.deleteOne(this.tableName, this);
  }

  // Return an array of all property names
  protected get dbFields(): string[] {
    const ctor = this.constructor as typeof Model;
    const schema = ctor.getSchema();
    const dbFields = schema.map(col => col.name);
    return dbFields;
  }
  // todo find a way to introduce this method back in
  // Merges child and parent schemas in one array
  protected static getSchema(this: typeof Model): TableSchema {
    const parent = Object.getPrototypeOf(this);
    const parentSchema = parent?.getSchema?.() ?? [];
    return [...parentSchema, ...this.schema];
  }

  // Make static db property available to class instances
  protected get db(): Database {
    return getDb();
  }
  
  // Make static tableName property available to class instances
  protected get tableName(): string {
    return (this.constructor as typeof Model & { tableName: string }).tableName;
  }

  // Create the table in the database
  static async init<T extends Model>(
    this: ModelClass<T>,
    db: Database
  ): Promise<boolean> {
    const name = this.tableName;
    console.log(`Initializing ${name} table...`);

    // Throw error if database is not defined
    if (!db) throw new Error(`Could not initialize ${name} table. No database provided`);
    this.db = db;

    // Create table in database using table schema
    // todo refactor this into a static method
    const parent = Object.getPrototypeOf(this);
    await this.db.createTable(this.tableName, { ...parent.schema, ...this.schema });
  
    console.log(`${name} table created!`);
    return true;
  }
}