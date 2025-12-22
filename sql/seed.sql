-- =========================================
-- DONNÉES DE TEST - MENU CAFÉTÉRIA ORIF
-- =========================================
-- Exécuter après schema.sql
-- =========================================

USE menu_cafet;

-- =========================================
-- PLATS D'EXEMPLE
-- =========================================

INSERT INTO dishes (name, dish_type, is_active) VALUES
  ('Salade verte', 'ENTREE', TRUE),
  ('Salade de tomates', 'ENTREE', TRUE),
  ('Carottes râpées', 'ENTREE', TRUE),
  
  ('Poulet rôti', 'PLAT', TRUE),
  ('Saumon grillé', 'PLAT', TRUE),
  ('Steak haché', 'PLAT', TRUE),
  ('Pâtes bolognaise', 'PLAT', TRUE),
  
  ('Riz', 'GARNITURE', TRUE),
  ('Pommes de terre', 'GARNITURE', TRUE),
  ('Pâtes', 'GARNITURE', TRUE),
  ('Frites', 'GARNITURE', TRUE),
  
  ('Brocoli', 'LEGUME', TRUE),
  ('Haricots verts', 'LEGUME', TRUE),
  ('Carottes', 'LEGUME', TRUE),
  ('Ratatouille', 'LEGUME', TRUE),
  
  ('Tarte aux pommes', 'DESSERT', TRUE),
  ('Mousse au chocolat', 'DESSERT', TRUE),
  ('Yaourt', 'DESSERT', TRUE),
  ('Fruit de saison', 'DESSERT', TRUE),
  
  ('Pain', 'AUTRE', TRUE),
  ('Salade de fruits', 'AUTRE', TRUE);

-- =========================================
-- MENUS SEMAINE 1 (6-10 janvier 2025)
-- =========================================

-- LUNDI 6 JANVIER 2025
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-06', 'MIDI');
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-06', 'SOIR');

-- MARDI 7 JANVIER 2025
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-07', 'MIDI');
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-07', 'SOIR');

-- MERCREDI 8 JANVIER 2025
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-08', 'MIDI');
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-08', 'SOIR');

-- JEUDI 9 JANVIER 2025
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-09', 'MIDI');
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-09', 'SOIR');

-- VENDREDI 10 JANVIER 2025
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-10', 'MIDI');
INSERT INTO meals (meal_date, meal_type) VALUES ('2025-01-10', 'SOIR');

-- =========================================
-- LIAISONS REPAS-PLATS (LUNDI MIDI)
-- =========================================

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Salade verte'),
  'ENTREE', 1;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Poulet rôti'),
  'PLAT', 2;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Frites'),
  'GARNITURE', 3;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Haricots verts'),
  'LEGUME', 4;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Tarte aux pommes'),
  'DESSERT', 5;

-- =========================================
-- LIAISONS REPAS-PLATS (LUNDI SOIR)
-- =========================================

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Salade de tomates'),
  'ENTREE', 1;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Saumon grillé'),
  'PLAT', 2;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Riz'),
  'GARNITURE', 3;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Brocoli'),
  'LEGUME', 4;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Yaourt'),
  'DESSERT', 5;

-- =========================================
-- LIAISONS REPAS-PLATS (MARDI MIDI)
-- =========================================

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Carottes râpées'),
  'ENTREE', 1;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Pâtes bolognaise'),
  'PLAT', 2;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Pain'),
  'AUTRE', 3;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Carottes'),
  'LEGUME', 4;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
  (SELECT id FROM dishes WHERE name = 'Mousse au chocolat'),
  'DESSERT', 5;

-- =========================================
-- LIAISONS REPAS-PLATS (MARDI SOIR)
-- =========================================

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Salade verte'),
  'ENTREE', 1;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Steak haché'),
  'PLAT', 2;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Pommes de terre'),
  'GARNITURE', 3;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Ratatouille'),
  'LEGUME', 4;

INSERT INTO meals_dishes (meal_id, dish_id, dish_type, position)
SELECT 
  (SELECT id FROM meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
  (SELECT id FROM dishes WHERE name = 'Fruit de saison'),
  'DESSERT', 5;

-- =========================================
-- FIN DU SCRIPT
-- =========================================

SELECT 'Données de test insérées avec succès!' AS message;
SELECT COUNT(*) AS total_dishes FROM dishes;
SELECT COUNT(*) AS total_meals FROM meals;
SELECT COUNT(*) AS total_liaisons FROM meals_dishes;
