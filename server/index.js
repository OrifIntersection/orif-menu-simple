import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import menuRoutes from './routes/menu.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Menu Cafeteria ORIF',
    version: '2.0.0',
    database: 'MySQL',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Creer un compte (admin only)',
        'POST /api/auth/login': 'Se connecter',
        'GET /api/auth/me': 'Profil utilisateur (auth requise)',
        'PUT /api/auth/password': 'Changer mot de passe (auth requise)'
      },
      menu: {
        'GET /api/dishes': 'Liste tous les plats',
        'GET /api/dishes/:id': 'Detail d\'un plat',
        'POST /api/dishes': 'Ajouter un plat',
        'PUT /api/dishes/:id': 'Modifier un plat',
        'DELETE /api/dishes/:id': 'Supprimer un plat',
        'GET /api/meals': 'Liste tous les repas',
        'GET /api/meals/:date': 'Repas par date',
        'GET /api/meals/week/:year/:week': 'Repas par semaine',
        'POST /api/meals': 'Creer un repas',
        'POST /api/meals/assign': 'Assigner un plat a un repas',
        'POST /api/meals/remove-dish': 'Retirer un plat d\'un repas',
        'POST /api/meals/clear': 'Vider un repas',
        'DELETE /api/meals/:id': 'Supprimer un repas'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);

if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur Express demarre sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
});

export default app;
