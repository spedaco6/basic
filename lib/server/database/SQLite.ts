import SQLiteDatabase from "better-sqlite3";
import { Database } from "./Database";
import { Model } from "../models/Model";
import { defaultQueryOptions } from "./Database";
import type { TableSchema, ColumnSchema, QueryOptions, IDatabaseConfig } from "./Database";
import "server-only";

export interface ISQLiteConfig extends IDatabaseConfig {
  path: string;
} 

export class SQLite extends Database {
  public db: SQLiteDatabase.Database;

  constructor(path: string) {
    super();
    this.db = new SQLiteDatabase(path);
  }

  // Returns sql IN statement
  private _getInSQL(val: any | any[]): string {
    if (Array.isArray(val) && val.length === 0) throw new Error("Invalid array of values provided");
    if (Array.isArray(val)) return `IN (${val.map(() => "?").join(", ")})`;
    return "= ?";
  }

  // Returns sql OR statement   (field = ? AND field2 = ?)
  // Works with nested or properties
  private _getOrSQL(filters: Record<string, any>): string {
    if (!Object.keys(filters).length) return "";
    const where = "(" + Object.entries(filters).map(([filter, val]) => {
      if (filter === "or") return this._getOrSQL(filters.or);
      if (filter === "and") return this._getAndSQL(filters.and);
      const equalsValue = this._getInSQL(val);
      return `${filter} ${equalsValue}`; // todo check filter against table schema columns
    }).join(" OR ") + ")";
    return where;
  }
  
  // Returns sql AND statement   (field = ? AND field2 = ?)
  // Works with nested and properties
  private _getAndSQL(filters: Record<string, any>): string {
    if (!Object.keys(filters).length) return "";
    const where = "(" + Object.entries(filters).map(([filter, val]) => {
      if (filter === "or") return this._getOrSQL(filters.or);
      if (filter === "and") return this._getAndSQL(filters.and);
      const equalsValue = this._getInSQL(val);
      return `${filter} ${equalsValue}`; // todo check filter against table schema columns
    }).join(" AND ") + ")";
    return where;
  }

  private _getValues(data: object): any[] {
    const values: any[] = [];
    if (Array.isArray(data)) return data;
    Object.values(data).forEach(val => {
      if (typeof val !== "object") values.push(val);
      else values.push(...this._getValues(val));
    });
    return values;
  }

  public async find<T extends Model>(
    tableName: string,
    filters: Record<string, any> = {},
    options: Partial<QueryOptions> = {},
    ...returnFields: string[]
  ): Promise<T[]> {

    let results: T[] = [];
    // Compile query options
    const queryOptions: Required<QueryOptions> = {
      ...defaultQueryOptions,
      ...options,
    };

    try {
      // get SELECT statement
      const select = returnFields.length ? 
        returnFields
          .map(field => field) // todo check field against table schema columns
          .join(", ") : 
        "*";

      // Get WHERE conditions
      const where = Object.keys(filters).length ? `WHERE ${this._getAndSQL(filters)}` : "";
      const values = this._getValues(filters);

      // Get ORDER BY ASC|DESC condition
      const order = `ORDER BY ${queryOptions.order}`; // todo check that this is safe
      const sort = queryOptions.sort.toLowerCase() === "asc" ? "ASC" : "DESC";

      // Get LIMIT condition
      let limit = "";
      if (!queryOptions?.limit && queryOptions?.skip) throw new Error("skip option must be used with limit option");

      if (queryOptions?.limit) {
        limit = `LIMIT ?`;
        values.push(queryOptions.limit);
        // Get OFFSET condition
        if (queryOptions?.skip) {
          limit += ` OFFSET ?`;
          values.push(queryOptions.skip);
        }
      }

      // Construct SQL
      const sql = `SELECT ${select} FROM ${tableName}
        ${ where }
        ${ order } ${ sort }
        ${ limit };
      `;

      // Run query
      results = this.db.prepare(sql).all(values) as any;
    } catch (err) {
      console.error(err);
    } finally {
      return results;
    }
  }

  // delete one record
  public async deleteOne<T extends Model>(tableName: string, data: T): Promise<boolean> {
    try {
      const id = data.id;
      if (!id) throw new Error("No id provided");
      const existingRecord = this.find(tableName, { id });
      if (!existingRecord) throw new Error(`Could not find a record to delete with id ${id}`);

      const sql = `DELETE FROM ${tableName}
        WHERE id = ?;`;
      const result = this.db.prepare(sql).run(id) as any;
      if (result.changes === 0) return false;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } 
  }

  // TODO currently this filters undefined records so DEFAULT schema applies
  // Find a way to allow for fields to be set to undefined when desired...
  // create one record 
  public async createOne<T extends Model>(tableName: string, data: T): Promise<T | null> {
    let dataModel: T | null = null;
    try {
      // Create sql string for field names   
      const fieldNames = Object.entries(data)
        .filter(([col, val]) => col !== "id" && val) // Filter out id and undefined values
        .map(([col]) => col) // todo check field against table schema column names
        .join(", ");

      // Create array of field values
      const fieldData = Object.entries(data)
        .filter(([key, val]) => key !== "id" && val) // Filter out id and undefined values
        .map(([_, value]) => value);

      // Create SQL for insert statement
      let sql = `INSERT INTO ${tableName} (
        ${ fieldNames }
      ) VALUES (${fieldData.map(d => "?").join(", ")})
      RETURNING *;`;
      // Query database to insert and retrieve the new record
      dataModel = this.db.prepare(sql).get(fieldData) as any;
    } catch (err) {
      console.error(err);
    } finally {
      return dataModel;
    }
  } 

  // TODO See the note at the start of createOne and ensure similar login here
  // Updates one record in the database
  public async updateOne<T extends Model>(tableName: string, data: T): Promise<T | null> {
    let updated: T | null = null;
    try {
      const id = data.id;
      if (!id) throw new Error("No id provided in the object");
      const originalRecord = this.find(tableName, { id });
      if (!originalRecord) throw new Error(`Could not find a record with id ${id}`);
      
      // Filter out fields that cannot be edited
      const editableFields = Object.entries(data)
      .filter(([key]) => key !== "id" && key !== "secureKey");
      const editableData = editableFields
      .map(([key, val]) => {
        if (typeof val !== "boolean") return val;
        if (val) return 1;
        return 0;
      });
      
      // Create strings that set updated values
      const fieldStr = editableFields.map(([key]) => `${key} = ?`).join(", "); // todo check key against tableschema column names
      
      const sql = `UPDATE ${tableName}
      SET ${fieldStr}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *;
      `;
      updated = this.db.prepare(sql).get([...editableData, id]) as any;
    } catch (err) {
      console.error(err);
    } finally {
      return updated;
    }
  }

  // Create table in the database
  public async createTable(tableName: string, tableSchema: TableSchema): Promise<void> {
    try {
      // confirm args and establish this.pool
      if (!tableName) throw new Error("No table name provided");
      if (!tableSchema) throw new Error(`No schema provided for ${tableName} table`);

      // Get SQL string for table columns
      const sql = this._createTableSchemaSQL(tableSchema);
      // Interpolate column names to prevent sql injection
      this.db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (
        ${ sql }
      );`);

      // If timestamp_update exists, set a trigger for the table
      const updateCol = tableSchema.find(col => col.type === "timestamp_update");
      if (updateCol) {
        const triggerSQL = this._createUpdateTrigger(tableName, updateCol);
        this.db.exec(triggerSQL);
      }
        
    } catch (err) {
      console.error("Error in creating table", err);
    }
  };

  // Delete a table from the database
  public async deleteTable(tableName: string): Promise<void> {
    try {
      // confirm args and establish this.pool
      if (!tableName) throw new Error("No table name provided");

      // Escape table name to ensure it is sql safe
      const name = tableName;
  
      // Drop table from the database
      this.db.exec(`DROP TABLE IF EXISTS ${name};`);
    } catch (err) {
      console.error("Error in deleting table", err);
    } finally {
    }
  };

  private _createUpdateTrigger = (tableName: string, updateSchema: ColumnSchema): string => {
    let triggerSQL = "";

    if (updateSchema.type === "timestamp_update") {
      triggerSQL = `
        CREATE TRIGGER IF NOT EXISTS trigger_on_${tableName}_update
        BEFORE UPDATE ON ${tableName}
        FOR EACH ROW
        WHEN OLD.${updateSchema.name} = NEW.${updateSchema.name}
        BEGIN
          SELECT NEW.${updateSchema.name} = CURRENT_TIMESTAMP;
        END;
      `;
    }

    return triggerSQL;
  }

  // Construct table SQL string based on TableSchema object
  private _createTableSchemaSQL = (tableSchema: TableSchema): string => {
    if (!tableSchema) throw new Error('No schema provided');
    let tableSQL: string[] = [];
  
    for (const col of tableSchema) {
      const sql = this._createColumnSchemaSQL(col);
      tableSQL.push(sql);
    }
    return tableSQL.join(",\n");
  }

  // Construct column SQL string based on ColumnSchema object
  private _createColumnSchemaSQL = (colSchema: ColumnSchema): string => {
    // Check for invalid column data
    if (!colSchema) throw new Error('No schema provided');
    if (!colSchema.name) throw new Error('Invalid column name');
    if (!colSchema.type) throw new Error('Invalid column type');
  
    // Map column name and type
    let colType = this._mapColumnType(colSchema.type);
    const isBoolean = colType === "BOOLEAN";
    colType = isBoolean ? "INTEGER" : colType;

    // Construct SQL string
    let sql: string = `${colSchema.name} ${colType}`;
    if (!colType.includes("TIMESTAMP")) {
      if (colSchema.primaryKey) sql += " PRIMARY KEY";
      if (colSchema.required || isBoolean) sql += " NOT NULL"; 
      if (colSchema.unique) sql += " UNIQUE";
      if (isBoolean) sql += ` CHECK (${colSchema.name} IN (0,1))`;
      if (colSchema.default !== undefined) {
        // if boolean, map default value to 0 or 1
        if (!isBoolean) {
          // if string, wrap default value in single quotes
          if (colType === "TEXT") {
            sql += ` DEFAULT '${colSchema.default}'`;
          } else {
            sql += ` DEFAULT ${colSchema.default}`;
          }
        } else {
          const value = typeof colSchema.default === "string" ? 
            colSchema.default.toLowerCase() : colSchema.default;
          const defaultBool = value === "true" || 
            value === true || value === 1;
          sql += ` DEFAULT ${defaultBool ? 1 : 0}`;
        }
      }
    }
    return sql;
  }

  // Map common column types to MySQL types
  private _mapColumnType = (type: string): string => {
    let columnType: string = "";
    switch (type.toLowerCase()) {
      case "text":
      case "string":
        columnType = "TEXT";
        break;
      case "int":
      case "integer":
      case "number":
        columnType = "INTEGER";
        break;
      case "bool":
      case "boolean":
        columnType = "BOOLEAN";
        break;
      case "timestamp_create":
        columnType = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        break;
      case "timestamp_update":
        columnType = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        break;
    }
    if (!columnType) throw new Error("Invalid column type");
    return columnType;
  }
}