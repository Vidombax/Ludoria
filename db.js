import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const db = new pg.Pool({
    connectionString: `${process.env.POSTGRES_URL.toString()}`,
})

export default db;
