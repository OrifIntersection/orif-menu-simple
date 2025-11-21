-- =========================================
-- AJOUTER DES MENUS DE TEST POUR LA SEMAINE 47
-- (17-21 novembre 2025 - Lundi à Vendredi)
-- =========================================
-- Ce script ajoute des menus complets avec des plats
-- pour voir les emojis en action !
-- =========================================

-- Semaine 47 : 17 au 21 novembre 2025
-- On crée seulement les jours de travail (Lundi-Vendredi)

-- =========================================
-- LUNDI 17 NOVEMBRE 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-17', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Frites' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Tarte aux pommes' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-17', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-17' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- MARDI 18 NOVEMBRE 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-18', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes bolognaise' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pain' LIMIT 1),
   'AUTRE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Mousse au chocolat' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-18', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Steak haché' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pommes de terre' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Ratatouille' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-18' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Fruit de saison' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- MERCREDI 19 NOVEMBRE 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-19', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-19', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-19' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de fruits' LIMIT 1),
   'AUTRE', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- JEUDI 20 NOVEMBRE 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-20', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Steak haché' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Frites' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Tarte aux pommes' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-20', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes bolognaise' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pain' LIMIT 1),
   'AUTRE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Ratatouille' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-20' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Mousse au chocolat' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- VENDREDI 21 NOVEMBRE 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-21', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pommes de terre' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Fruit de saison' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-11-21', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-11-21' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- FIN DU SCRIPT
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Menus de test ajoutés pour la semaine 47 !';
  RAISE NOTICE '';
  RAISE NOTICE '📅 Dates : 17-21 novembre 2025 (Lundi-Vendredi)';
  RAISE NOTICE '🍽️ Repas : 2 par jour (MIDI + SOIR)';
  RAISE NOTICE '🥗 Chaque repas contient : Entrée, Plat, Garniture, Légume, Dessert';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Rafraîchissez la page web pour voir les emojis ! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Pour vérifier :';
  RAISE NOTICE '   SELECT * FROM public.meals WHERE meal_date >= ''2025-11-17'' AND meal_date <= ''2025-11-21'';';
END $$;
