import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'menu-cafet-orif-dev-secret-2025';
const JWT_EXPIRES_IN = '24h';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

router.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email et mot de passe requis' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }
  
  const userRole = role === 'admin' ? 'admin' : 'viewer';
  
  try {
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username ou email déjà utilisé' });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name || null, userRole]
    );
    
    const userId = result.rows.insertId;
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: userId, username, email, full_name, role: userRole }
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { role, is_active } = req.body;
  
  if (parseInt(id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'Vous ne pouvez pas retirer vos propres droits admin' });
  }
  
  try {
    const updates = [];
    const values = [];
    
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune modification spécifiée' });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Utilisateur modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
});

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username et mot de passe requis' });
  }
  
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
  }
  
  try {
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const validPassword = await bcrypt.compare(current_password, result.rows[0].password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }
    
    const new_hash = await bcrypt.hash(new_password, 10);
    
    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [new_hash, req.user.id]
    );
    
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

export default router;
