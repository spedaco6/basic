import { Model } from "../models/Model";

export interface IDatabaseConfig {
  type: 'mysql' | 'sqlite';
}

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
  unique?: boolean,
  default?: any,
};

export type TableSchema = ColumnSchema[];

export abstract class Database {
  abstract createTable(tableName: string, tableSchema: TableSchema): Promise<void>;
  abstract deleteTable(tableName: string): Promise<void>;
  abstract createOne<T extends Model>(tableName: string, data: T): Promise<T | null>;
  abstract deleteOne<T extends Model>(tableName: string, data: T): Promise<boolean>;  
  abstract updateOne<T extends Model>(tableName: string, data: T): Promise<T | null>;

  abstract find<T extends Model>(
    tableName: string,
    filters: Record<string, any>,
    options: Partial<QueryOptions>,
    ...returnFields: string[]
  ): Promise<T[]>;
}