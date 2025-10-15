import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Create SQLite database connection
const sqlite = new Database('./src/lib/db/sqlite.db');

// Create Drizzle database instance
export const db = drizzle(sqlite, { schema });

// Export schema types
export * from './schema';
