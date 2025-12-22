import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export { pool };
export default { query, pool };
