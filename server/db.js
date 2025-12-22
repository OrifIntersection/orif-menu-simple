import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menu_cafet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('Connecté à MySQL');
    conn.release();
  })
  .catch(err => {
    console.log('MySQL non disponible, données fictives utilisées');
  });

export default {
  query: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  },
  pool
};
