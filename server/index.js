import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import menuRoutes from './routes/menu.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Menu Cafétéria ORIF',
    version: '2.0.0',
    database: 'MySQL',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Créer un compte',
        'POST /api/auth/login': 'Se connecter',
        'GET /api/auth/me': 'Profil utilisateur (auth requise)',
        'PUT /api/auth/password': 'Changer mot de passe (auth requise)'
      },
      menu: {
        'GET /api/dishes': 'Liste tous les plats',
        'GET /api/dishes/:id': 'Détail d\'un plat',
        'POST /api/dishes': 'Ajouter un plat',
        'PUT /api/dishes/:id': 'Modifier un plat',
        'DELETE /api/dishes/:id': 'Supprimer un plat',
        'GET /api/meals': 'Liste tous les repas',
        'GET /api/meals/:date': 'Repas par date',
        'POST /api/meals': 'Créer un repas',
        'DELETE /api/meals/:id': 'Supprimer un repas'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur Express démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
});

export default app;
