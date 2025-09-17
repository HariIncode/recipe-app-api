import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { ENV } from './env.js';
import * as schema from '../db/schema.js';

// Connect to the database
const sql = neon(ENV.DATABASE_URL);
// Initialize Drizzle ORM with the database connection and schema ( Creating a table if it doesn't exist)
export const db = drizzle(sql, { schema });