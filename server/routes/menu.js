import express from 'express';
import db from '../db.js';

const router = express.Router();

const DISH_TYPES = ['ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE'];
const MEAL_TYPES = ['MIDI', 'SOIR'];

let fictiveData = {
  dishes: [
    { id: 1, name: 'Spaghetti Bolognaise', dish_type: 'PLAT', created_at: new Date() },
    { id: 2, name: 'Salade verte', dish_type: 'ENTREE', created_at: new Date() },
    { id: 3, name: 'Riz', dish_type: 'GARNITURE', created_at: new Date() },
    { id: 4, name: 'Haricots verts', dish_type: 'LEGUME', created_at: new Date() },
    { id: 5, name: 'Mousse au chocolat', dish_type: 'DESSERT', created_at: new Date() },
    { id: 6, name: 'Pain', dish_type: 'AUTRE', created_at: new Date() }
  ],
  meals: [
    { 
      id: 1, 
      meal_date: '2025-01-06', 
      meal_type: 'MIDI',
      created_at: new Date(),
      dishes: [
        { id: 1, name: 'Spaghetti Bolognaise', dish_type: 'PLAT' },
        { id: 2, name: 'Salade verte', dish_type: 'ENTREE' },
        { id: 3, name: 'Riz', dish_type: 'GARNITURE' }
      ]
    },
    { 
      id: 2, 
      meal_date: '2025-01-06', 
      meal_type: 'SOIR',
      created_at: new Date(),
      dishes: [
        { id: 4, name: 'Haricots verts', dish_type: 'LEGUME' },
        { id: 5, name: 'Mousse au chocolat', dish_type: 'DESSERT' }
      ]
    },
    { 
      id: 3, 
      meal_date: '2025-01-07', 
      meal_type: 'MIDI',
      created_at: new Date(),
      dishes: [
        { id: 1, name: 'Spaghetti Bolognaise', dish_type: 'PLAT' },
        { id: 6, name: 'Pain', dish_type: 'AUTRE' }
      ]
    }
  ]
};

router.get('/dishes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dishes WHERE is_active = TRUE ORDER BY id');
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
    const result = await db.query('SELECT * FROM dishes WHERE id = ?', [id]);
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
  const { name, dish_type } = req.body;
  
  if (!name || !dish_type) {
    return res.status(400).json({ error: 'Nom et type requis' });
  }
  
  if (!DISH_TYPES.includes(dish_type)) {
    return res.status(400).json({ 
      error: `Type invalide. Types valides: ${DISH_TYPES.join(', ')}` 
    });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO dishes (name, dish_type) VALUES (?, ?)',
      [name, dish_type]
    );
    const newDish = { id: result.rows.insertId, name, dish_type, created_at: new Date() };
    res.status(201).json(newDish);
  } catch (error) {
    const newId = Math.max(...fictiveData.dishes.map(d => d.id)) + 1;
    const newDish = { id: newId, name, dish_type, created_at: new Date() };
    fictiveData.dishes.push(newDish);
    res.status(201).json(newDish);
  }
});

router.put('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dish_type } = req.body;
  
  if (dish_type && !DISH_TYPES.includes(dish_type)) {
    return res.status(400).json({ 
      error: `Type invalide. Types valides: ${DISH_TYPES.join(', ')}` 
    });
  }
  
  try {
    await db.query(
      'UPDATE dishes SET name = COALESCE(?, name), dish_type = COALESCE(?, dish_type), updated_at = NOW() WHERE id = ?',
      [name || null, dish_type || null, id]
    );
    const result = await db.query('SELECT * FROM dishes WHERE id = ?', [id]);
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
    if (dish_type) fictiveData.dishes[index].dish_type = dish_type;
    res.json(fictiveData.dishes[index]);
  }
});

router.delete('/dishes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM dishes WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }
    await db.query('DELETE FROM dishes WHERE id = ?', [id]);
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
    const mealsResult = await db.query(`
      SELECT * FROM meals ORDER BY meal_date, meal_type
    `);
    
    if (mealsResult.rows.length === 0) {
      return res.json(fictiveData.meals);
    }
    
    const meals = [];
    for (const meal of mealsResult.rows) {
      const dishesResult = await db.query(`
        SELECT d.id, d.name, d.dish_type 
        FROM dishes d
        JOIN meals_dishes md ON d.id = md.dish_id
        WHERE md.meal_id = ?
        ORDER BY md.position
      `, [meal.id]);
      
      meals.push({
        ...meal,
        dishes: dishesResult.rows
      });
    }
    
    res.json(meals);
  } catch (error) {
    console.log('Base de données non disponible, données fictives utilisées');
    res.json(fictiveData.meals);
  }
});

router.get('/meals/:date', async (req, res) => {
  const { date } = req.params;
  
  try {
    const mealsResult = await db.query(`
      SELECT * FROM meals WHERE meal_date = ? ORDER BY meal_type
    `, [date]);
    
    if (mealsResult.rows.length === 0) {
      const meals = fictiveData.meals.filter(m => m.meal_date === date);
      return res.json(meals);
    }
    
    const meals = [];
    for (const meal of mealsResult.rows) {
      const dishesResult = await db.query(`
        SELECT d.id, d.name, d.dish_type 
        FROM dishes d
        JOIN meals_dishes md ON d.id = md.dish_id
        WHERE md.meal_id = ?
        ORDER BY md.position
      `, [meal.id]);
      
      meals.push({
        ...meal,
        dishes: dishesResult.rows
      });
    }
    
    res.json(meals);
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
      'INSERT INTO meals (meal_date, meal_type) VALUES (?, ?)',
      [meal_date, meal_type]
    );
    
    const mealId = mealResult.rows.insertId;
    
    if (dish_ids && dish_ids.length > 0) {
      for (let i = 0; i < dish_ids.length; i++) {
        const dishResult = await db.query('SELECT dish_type FROM dishes WHERE id = ?', [dish_ids[i]]);
        const dishType = dishResult.rows[0]?.dish_type || 'AUTRE';
        
        await db.query(
          'INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position) VALUES (?, ?, ?, ?)',
          [mealId, dish_ids[i], dishType, i + 1]
        );
      }
    }
    
    res.status(201).json({ id: mealId, meal_date, meal_type });
  } catch (error) {
    console.error('Erreur création repas:', error);
    const newId = Math.max(...fictiveData.meals.map(m => m.id)) + 1;
    const newMeal = { id: newId, meal_date, meal_type, dishes: [] };
    fictiveData.meals.push(newMeal);
    res.status(201).json(newMeal);
  }
});

router.delete('/meals/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM meals WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    await db.query('DELETE FROM meals WHERE id = ?', [id]);
    res.json({ message: 'Repas supprimé', meal: result.rows[0] });
  } catch (error) {
    const index = fictiveData.meals.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    const deleted = fictiveData.meals.splice(index, 1);
    res.json({ message: 'Repas supprimé', meal: deleted[0] });
  }
});

export default router;
