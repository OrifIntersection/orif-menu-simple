import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menu.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Menu Cafétéria ORIF',
    version: '1.0.0',
    endpoints: {
      'GET /api/meals': 'Liste tous les repas',
      'GET /api/meals/:date': 'Repas par date',
      'GET /api/dishes': 'Liste tous les plats',
      'POST /api/dishes': 'Ajouter un plat',
      'PUT /api/dishes/:id': 'Modifier un plat',
      'DELETE /api/dishes/:id': 'Supprimer un plat'
    }
  });
});

app.use('/api', menuRoutes);

app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur Express démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
});

export default app;
