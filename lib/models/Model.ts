import { SQLite } from "../database/SQLite";
import type { Database, QueryOptions, TableSchema } from "../database/Database";
import { nanoid } from "nanoid";
import { getDb } from "../database/db";

export abstract class Model {
  protected static schema: Readonly<TableSchema> = [
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
  static initialized: boolean = false;
  static db?: Database;

  constructor() {}

  // find records by criteria
  static async find<T extends Model>(
    this: {
      new (...args: any[]): T,
      getTableName(): string;
    },
    filters: Record<string, any>,
    options: QueryOptions,
    ...returnFields: string[]
  ): Promise<Record<string, any>[] | null> {
    const db = getDb();
    const models = await db.find(this.getTableName(), filters, options, ...returnFields);
    return models;
  }

  // find record by id
  static async findById<T extends Model>(
    // This is defined as a class that creates an instance of Model
    // and contains a db property and getTableName() method
    this: { 
      new (...args: any[]): T; // makes this a constructor and not an instance
      getTableName(): string;
    }, 
    id?: number | null,
    ...returnFields: string[]
  ): Promise<InstanceType<typeof this> | null | Record<string, any>> { // typeof this because this is a constructor
    const db = getDb();
    if (!id) throw new Error("No id provided");
    const data = await db.find(this.getTableName(), { id }, {}, ...returnFields);
    const model = data.length ? data[0] : null;
    // If specific fields are requested, return a plain object of requested fields
    if (returnFields.length) return model;
    // No specific return fields, return instance of Model
    return model ? new this(model) : model;
  }

  static async findOne<T extends Model>(
    this: {
      new (...args: any[]): T;
      getTableName(): string;
    },
    filters: Record<string, any>,
    ...returnFields: string[]
  ): Promise<InstanceType<typeof this> | null | Record<string, any>> {
    const db = getDb();
    const data = await db.find(this.getTableName(), filters, { limit: 1 }, ...returnFields);
    const model = data.length ? data[0] : null;
    if (returnFields.length) return model as Record<string, any>;
    return model ? new this(model) : model;
  }

  // Save new or update existing Model subclass
  public async save(): Promise<this> {
    // Save model to database
    const db = getDb();
    let saved = null;
    if (!this.id) {
      // add secure id locally if it doesn't already exist
      this.secureKey = this.secureKey ?? nanoid();
      saved = await db.createOne(this.tableName, this);
      // If initial save fails, remove secure key
      if (!saved) this.secureKey = undefined;
    } else {
      saved = await db.updateOne(this.tableName, this);
    }

    if (!saved) throw new Error("Could not save model");

    // Update local model
    Object.assign(this, saved);
    return this;
  }

  // deletes user from the database
  public async delete(): Promise<void> {
    const db = getDb();
    if (!this.id) throw new Error("No id provided for deletion");
    await db.deleteOne(this.tableName, this);
  }

  // Return an array of all property names todo
  protected get dbFields(): string[] {
    const ctor = this.constructor as typeof Model;
    const schema = ctor.getSchema();
    const dbFields = schema.map(col => col.name);
    return dbFields;
  }

  // Merges child and parent schemas in one array todo
  protected static getSchema(this: typeof Model): TableSchema {
    const parent = Object.getPrototypeOf(this);
    const parentSchema = parent?.getSchema?.() ?? [];
    return [...parentSchema, ...this.schema];
  }

  // Make static db property available to class instances
  protected get db(): Database {
    return getDb();
  }
  
  // Make static tableName property available to class instances todo
  protected get tableName(): string {
    return (this.constructor as typeof Model).getTableName();
  }
  
  // Create a plural, lowercase table name based on class name todo
  public static getTableName(): string {
    let tableName = this.name.toLowerCase();
    tableName += tableName.endsWith("s") ? "" : "s";
    return tableName;
  }

  // Create the table in the database todo
  static async init(db: Database): Promise<void> {
    if (this.initialized) return;
    // Ensure that init is not called on the parent Model class
    if (this === Model) throw new Error("Cannot initialize Model class directly");

    const name = this.getTableName();
    
    console.log(`Initializing ${name} table...`);

    // Throw error if database is not defined
    if (!db) throw new Error(`Could not initialize ${name} table. No database provided`);
    this.db = db;

    // Create table in database using table schema
    await this.db.createTable(this.getTableName(), this.getSchema());
    this.initialized = true;
    console.log(`${name} table created`);
  }
}