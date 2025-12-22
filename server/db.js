import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let isConnected = false;

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
    isConnected = true;
    conn.release();
  })
  .catch(err => {
    console.log('MySQL non disponible, données fictives utilisées');
    isConnected = false;
  });

const DEMO_ADMIN_HASH = bcrypt.hashSync('admin123', 10);

const fictiveUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@orif.ch',
    password_hash: DEMO_ADMIN_HASH,
    full_name: 'Administrateur',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export default {
  query: async (sql, params = []) => {
    if (!isConnected) {
      if (sql.includes('SELECT') && sql.includes('users') && sql.includes('WHERE')) {
        const searchTerm = params[0];
        const user = fictiveUsers.find(u => 
          u.username === searchTerm || u.email === searchTerm || u.id === searchTerm
        );
        return { rows: user ? [user] : [] };
      }
      if (sql.includes('SELECT') && sql.includes('users') && !sql.includes('WHERE')) {
        return { rows: fictiveUsers };
      }
      return { rows: [] };
    }
    
    const [rows] = await pool.execute(sql, params);
    return { rows };
  },
  pool,
  isConnected: () => isConnected
};
