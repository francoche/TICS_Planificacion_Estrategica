import { Pool } from 'pg';

// Esto lee automáticamente tu archivo .env buscando variables
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});