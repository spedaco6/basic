import Database from "better-sqlite3";
// import "server-only";
// todo REMOVE PROMISES
interface Model {};

export interface QueryOptions {
  sort: "asc" | "desc",
  order: string,
  limit: number,
  skip: number,
}
export const defaultQueryOptions: QueryOptions = {
  order: "id",
  sort: "asc",
  limit: 0,
  skip: 0,
}
export interface ColumnSchema {
  name: string,
  type: string,
  primaryKey?: boolean,
  required?: boolean,
  autoIncrement?: boolean,
  unique?: boolean,
  default?: any,
};

export type TableSchema = ColumnSchema[];

export class SQLite {
  public db: Database.Database;

  constructor(path: string) {
    this.db = new Database(path);
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

    let models: T[] = [];
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

      // Construct SQL todo protect against tableName injection
      const sql = `SELECT ${select} FROM ${tableName}
        ${ where }
        ${ order } ${ sort }
        ${ limit };
      `;

      // Run query
      const [ results ] = await this.pool.query(sql, values) as any; // todo change query to sqlite

      models = [...results];
    } catch (err) {
      console.error(err);
    } finally {
      return models;
    }
  }

  // delete one record
  public async deleteOne<T extends Model>(tableName: string, data: T): Promise<boolean> {
    try {
      const id = data.id;
      if (!id) throw new Error("No id provided");
      const existingRecord = this.find(tableName, { id });
      if (!existingRecord) throw new Error(`Could not find a record to delete with id ${id}`);

      // todo confirm table name is safe
      const sql = `DELETE FROM ${tableName}
        WHERE id = ?;
      `;

      const [{ affectedRows }] = await this.pool.query(sql, [id]) as any;
      if (affectedRows !== 1) return false;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } 
    
  }

  // create one record 
  public async createOne<T extends Model>(tableName: string, data: T): Promise<T | null> {
    let dataModel: T | null = null;
    try {

      // Create sql string for field names   
      const fieldNames = Object.keys(data)
        .filter(field => field !== "id")
        .map(field => field) // todo check field against table schema column names
        .join(", ");

      // Create array of field values
      const fieldData = Object.entries(data)
        .filter(([key]) => key !== "id")
        .map(([_, value]) => value);

      // Create SQL for insert statement todo check that tableName is safe
      let sql = `INSERT INTO ${tableName} (
        ${ fieldNames }
      ) VALUES (${fieldData.map(d => "?").join(", ")});`;

      // Query database to insert the new record
      const [{ insertId }] = await this.pool.query<ResultSetHeader>(sql, fieldData); // todo conver to sqlite

      // Fetch the new record based on record id
      const result = await this.find(tableName, { id: insertId }) as any;
      if (result.length) dataModel = result[0];
    } catch (err) {
      console.error(err);
    } finally {
      return dataModel;
    }
  } 

  // Updates one record in the database
  public async updateOne<T extends Model>(tableName: string, data: T): Promise<T | null> {
    let updated: T | null = null;
    try {
      const id = data.id;
      if (!id) throw new Error("No id provided in the object");
      const originalRecord = await this.find(tableName, { id });
      if (!originalRecord) throw new Error(`Could not find a record with id ${id}`);

      // Filter out fields that cannot be edited
      const editableFields = Object.entries(data).filter(([key]) => key !== "id");
      const editableData = editableFields.map(([key, val]) => val);

      // Create strings that set updated values
      const fieldStr = editableFields.map(([key]) => `${key} = ?`).join(", "); // todo check key against tableschema column names

      //todo be sure tableName is safe
      const sql = `UPDATE ${tableName}
        SET ${fieldStr}
        WHERE id = ?;
      `
      const [{ changedRows }] = await this.pool.query(sql, [...editableData, id]) as any; // todo conver to sqlite
      if (changedRows === 0) throw new Error("Could not update record");

      const result = await this.find(tableName, { id }) as any;
      if (result.length) updated = result[0];
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

      // Escape table name to ensure it is sql safe
      const name = tableName; // todo be sure tableName is safe

      // Get SQL string for table columns
      const sql = this._createTableSchemaSQL(tableSchema);
      
      // Interpolate column names to prevent sql injection // todo convert to sqlite
      await this.pool.query(`CREATE TABLE IF NOT EXISTS ${name} (
        ${ sql }
      );`);
        
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
      const name = tableName; // todo be sure tableName is safe
  
      // Drop table from the database
      await this.pool.query(`DROP TABLE IF EXISTS ${name};`); // todo conver to sqlite
    } catch (err) {
      console.error("Error in deleting table", err);
    } finally {
    }
  };

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
    const colType = this._mapColumnType(colSchema.type);

    // Construct SQL string
    let sql: string = `${colSchema.name} ${colType}`; // todo trust column schema name?
    if (!colType.includes("TIMESTAMP")) {
      sql += `${colSchema.primaryKey ? " PRIMARY KEY" : ""}`;
      sql += `${colSchema.autoIncrement ? " AUTO_INCREMENT" : ""}`; // todo Change to AUTOINCREMENT
      sql += `${colSchema.required ? " NOT NULL" : ""}`;
      sql += `${colSchema.unique ? " UNIQUE" : ""}`;
      // sql += `${colSchema.default ? `DEFAULT ${colSchema.default}` : ""}`
      // todo add default (preexisting before sqlite)
    }
    return sql;
  }

  // Map common column types to MySQL types
  private _mapColumnType = (type: string): string => { // todo map columns to SQLite like INTEGER
    let columnType: string = "";
    switch (type.toLowerCase()) {
      case "text":
      case "string":
        columnType = "TEXT";
        break;
      case "int":
      case "number":
        columnType = "INT";
        break;
      case "bool":
      case "boolean":
        columnType = "BOOLEAN";
        break;
      case "timestamp_create":
        columnType = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
        break;
      case "timestamp_update":
        columnType = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
        break;
    }
    if (!columnType) throw new Error("Invalid column type");
    return columnType;
  }
}

const database = new SQLite("./lib/database/sqlite.db");
// database.createTable();
// database.deleteTable();




/* 
// Create and delete table
  static createTable(tableName: string, tableSchema: Readonly<TableSchema>): void {
    
  }
  public deleteTable(tableName: string): void {}

  // Methods for creating, updating, and deleting records
  public createOne<T extends Model>(tableName: string, data: T): T | null { return {} as T };
  public updateOne<T extends Model>(tableName: string, data: T): T | null { return {} as T };
  public deleteOne<T extends Model>(tableName: string, data: T): boolean { return true };

  // Methods for getting records
  public find<T extends Model>(
    tableName: string,
    filters: Record<string, any>,
    options: Partial<QueryOptions>,
    ...returnFields: string[]
  ): T[] { return [] }; */