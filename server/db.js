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

let nextUserId = 2;

export default {
  query: async (sql, params = []) => {
    if (!isConnected) {
      const sqlLower = sql.toLowerCase();
      
      if (sqlLower.includes('select') && sqlLower.includes('users') && sqlLower.includes('where')) {
        const searchTerm = params[0];
        const user = fictiveUsers.find(u => 
          u.username === searchTerm || u.email === searchTerm || u.id === searchTerm
        );
        return { rows: user ? [user] : [] };
      }
      
      if (sqlLower.includes('select') && sqlLower.includes('users') && !sqlLower.includes('where')) {
        return { rows: [...fictiveUsers] };
      }
      
      if (sqlLower.includes('insert') && sqlLower.includes('users')) {
        const [username, email, password_hash, full_name, role] = params;
        const existing = fictiveUsers.find(u => u.username === username || u.email === email);
        if (existing) {
          throw new Error('Username ou email déjà utilisé');
        }
        const newUser = {
          id: nextUserId++,
          username,
          email,
          password_hash,
          full_name: full_name || null,
          role: role || 'viewer',
          is_active: true,
          created_at: new Date().toISOString()
        };
        fictiveUsers.push(newUser);
        console.log('Utilisateur créé:', username, role);
        return { rows: { insertId: newUser.id } };
      }
      
      if (sqlLower.includes('update') && sqlLower.includes('users')) {
        const userId = params[params.length - 1];
        const user = fictiveUsers.find(u => u.id === parseInt(userId));
        if (user) {
          const fields = sql.match(/(\w+)\s*=\s*\?/g) || [];
          fields.forEach((field, index) => {
            const fieldName = field.split('=')[0].trim();
            const value = params[index];
            if (fieldName === 'username') user.username = value;
            if (fieldName === 'email') user.email = value;
            if (fieldName === 'full_name') user.full_name = value;
            if (fieldName === 'password_hash') user.password_hash = value;
            if (fieldName === 'role') user.role = value;
            if (fieldName === 'is_active') user.is_active = value;
          });
          console.log('Utilisateur modifié:', user.username);
        }
        return { rows: [] };
      }
      
      if (sqlLower.includes('delete') && sqlLower.includes('users')) {
        const userId = parseInt(params[0]);
        const index = fictiveUsers.findIndex(u => u.id === userId);
        if (index > -1) {
          const deleted = fictiveUsers.splice(index, 1);
          console.log('Utilisateur supprimé:', deleted[0]?.username);
        }
        return { rows: [] };
      }
      
      return { rows: [] };
    }
    
    const [rows] = await pool.execute(sql, params);
    return { rows };
  },
  pool,
  isConnected: () => isConnected
};
