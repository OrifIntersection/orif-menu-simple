import express from 'express';
import db from '../db.js';

const router = express.Router();

const DISH_TYPES = ['ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE'];
const MEAL_TYPES = ['MIDI', 'SOIR'];

let fictiveData = {
  dishes: [
    { id: 1, name: 'Spaghetti Bolognaise', type: 'PLAT', created_at: new Date() },
    { id: 2, name: 'Salade verte', type: 'ENTREE', created_at: new Date() },
    { id: 3, name: 'Riz', type: 'GARNITURE', created_at: new Date() },
    { id: 4, name: 'Haricots verts', type: 'LEGUME', created_at: new Date() },
    { id: 5, name: 'Mousse au chocolat', type: 'DESSERT', created_at: new Date() },
    { id: 6, name: 'Pain', type: 'AUTRE', created_at: new Date() }
  ],
  meals: [
    { id: 1, meal_date: '2025-01-06', meal_type: 'MIDI' },
    { id: 2, meal_date: '2025-01-06', meal_type: 'SOIR' },
    { id: 3, meal_date: '2025-01-07', meal_type: 'MIDI' }
  ],
  meals_dishes: [
    { meal_id: 1, dish_id: 1 },
    { meal_id: 1, dish_id: 2 },
    { meal_id: 1, dish_id: 3 },
    { meal_id: 2, dish_id: 4 },
    { meal_id: 2, dish_id: 5 }
  ]
};

router.get('/dishes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dishes ORDER BY id');
    if (result.rows.length === 0) {
      return res.json(fictiveData.dishes);
    }
    res.json(result.rows);
  } catch (error) {
    console.log('Base de données non disponible, données fictives utilisées');
    res.json(fictiveData.dishes);
  }
});

router.get('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM dishes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const dish = fictiveData.dishes.find(d => d.id === parseInt(id));
      return dish ? res.json(dish) : res.status(404).json({ error: 'Plat non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    const dish = fictiveData.dishes.find(d => d.id === parseInt(id));
    dish ? res.json(dish) : res.status(404).json({ error: 'Plat non trouvé' });
  }
});

router.post('/dishes', async (req, res) => {
  const { name, type } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Nom et type requis' });
  }
  
  if (!DISH_TYPES.includes(type)) {
    return res.status(400).json({ 
      error: `Type invalide. Types valides: ${DISH_TYPES.join(', ')}` 
    });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO dishes (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    const newId = Math.max(...fictiveData.dishes.map(d => d.id)) + 1;
    const newDish = { id: newId, name, type, created_at: new Date() };
    fictiveData.dishes.push(newDish);
    res.status(201).json(newDish);
  }
});

router.put('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  
  if (type && !DISH_TYPES.includes(type)) {
    return res.status(400).json({ 
      error: `Type invalide. Types valides: ${DISH_TYPES.join(', ')}` 
    });
  }
  
  try {
    const result = await db.query(
      'UPDATE dishes SET name = COALESCE($1, name), type = COALESCE($2, type) WHERE id = $3 RETURNING *',
      [name, type, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    const index = fictiveData.dishes.findIndex(d => d.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }
    if (name) fictiveData.dishes[index].name = name;
    if (type) fictiveData.dishes[index].type = type;
    res.json(fictiveData.dishes[index]);
  }
});

router.delete('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM dishes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }
    res.json({ message: 'Plat supprimé', dish: result.rows[0] });
  } catch (error) {
    const index = fictiveData.dishes.findIndex(d => d.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }
    const deleted = fictiveData.dishes.splice(index, 1);
    res.json({ message: 'Plat supprimé', dish: deleted[0] });
  }
});

router.get('/meals', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, 
        json_agg(json_build_object('id', d.id, 'name', d.name, 'type', d.type)) as dishes
      FROM meals m
      LEFT JOIN meals_dishes md ON m.id = md.meal_id
      LEFT JOIN dishes d ON md.dish_id = d.id
      GROUP BY m.id
      ORDER BY m.meal_date, m.meal_type
    `);
    if (result.rows.length === 0) {
      return res.json(fictiveData.meals);
    }
    res.json(result.rows);
  } catch (error) {
    console.log('Base de données non disponible, données fictives utilisées');
    res.json(fictiveData.meals);
  }
});

router.get('/meals/:date', async (req, res) => {
  const { date } = req.params;
  
  try {
    const result = await db.query(`
      SELECT m.*, 
        json_agg(json_build_object('id', d.id, 'name', d.name, 'type', d.type)) as dishes
      FROM meals m
      LEFT JOIN meals_dishes md ON m.id = md.meal_id
      LEFT JOIN dishes d ON md.dish_id = d.id
      WHERE m.meal_date = $1
      GROUP BY m.id
      ORDER BY m.meal_type
    `, [date]);
    
    if (result.rows.length === 0) {
      const meals = fictiveData.meals.filter(m => m.meal_date === date);
      return res.json(meals);
    }
    res.json(result.rows);
  } catch (error) {
    const meals = fictiveData.meals.filter(m => m.meal_date === date);
    res.json(meals);
  }
});

router.post('/meals', async (req, res) => {
  const { meal_date, meal_type, dish_ids } = req.body;
  
  if (!meal_date || !meal_type) {
    return res.status(400).json({ error: 'Date et type de repas requis' });
  }
  
  if (!MEAL_TYPES.includes(meal_type)) {
    return res.status(400).json({ 
      error: `Type de repas invalide. Types valides: ${MEAL_TYPES.join(', ')}` 
    });
  }
  
  try {
    const mealResult = await db.query(
      'INSERT INTO meals (meal_date, meal_type) VALUES ($1, $2) RETURNING *',
      [meal_date, meal_type]
    );
    
    const meal = mealResult.rows[0];
    
    if (dish_ids && dish_ids.length > 0) {
      for (const dish_id of dish_ids) {
        await db.query(
          'INSERT INTO meals_dishes (meal_id, dish_id) VALUES ($1, $2)',
          [meal.id, dish_id]
        );
      }
    }
    
    res.status(201).json(meal);
  } catch (error) {
    const newId = Math.max(...fictiveData.meals.map(m => m.id)) + 1;
    const newMeal = { id: newId, meal_date, meal_type };
    fictiveData.meals.push(newMeal);
    res.status(201).json(newMeal);
  }
});

export default router;
