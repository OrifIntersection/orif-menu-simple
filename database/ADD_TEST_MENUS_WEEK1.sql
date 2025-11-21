-- =========================================
-- AJOUTER DES MENUS DE TEST POUR LA SEMAINE 1
-- (6-10 janvier 2025 - Lundi à Vendredi)
-- =========================================
-- Ce script ajoute des menus complets avec des plats
-- pour voir les emojis en action !
-- =========================================

-- Semaine 1 : 6 au 10 janvier 2025
-- On crée seulement les jours de travail (Lundi-Vendredi)

-- =========================================
-- LUNDI 6 JANVIER 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-06', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Frites' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Tarte aux pommes' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-06', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-06' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- MARDI 7 JANVIER 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-07', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes bolognaise' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pain' LIMIT 1),
   'AUTRE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Mousse au chocolat' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-07', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Steak haché' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pommes de terre' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Ratatouille' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-07' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Fruit de saison' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- MERCREDI 8 JANVIER 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-08', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-08', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-08' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de fruits' LIMIT 1),
   'AUTRE', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- JEUDI 9 JANVIER 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-09', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Steak haché' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Frites' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Tarte aux pommes' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-09', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade de tomates' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pâtes bolognaise' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Pain' LIMIT 1),
   'AUTRE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Ratatouille' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-09' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Mousse au chocolat' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- VENDREDI 10 JANVIER 2025
-- =========================================

-- MIDI
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-10', 'MIDI')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Carottes râpées' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Saumon grillé' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Pommes de terre' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Brocoli' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'MIDI'),
   (SELECT id FROM public.dishes WHERE name = 'Fruit de saison' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- SOIR
INSERT INTO public.meals (meal_date, meal_type)
VALUES ('2025-01-10', 'SOIR')
ON CONFLICT (meal_date, meal_type) DO NOTHING;

INSERT INTO public.meals_dishes (meal_id, dish_id, dish_type, position)
VALUES 
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Salade verte' LIMIT 1),
   'ENTREE', 1),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Poulet rôti' LIMIT 1),
   'PLAT', 2),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Riz' LIMIT 1),
   'GARNITURE', 3),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Haricots verts' LIMIT 1),
   'LEGUME', 4),
  ((SELECT id FROM public.meals WHERE meal_date = '2025-01-10' AND meal_type = 'SOIR'),
   (SELECT id FROM public.dishes WHERE name = 'Yaourt' LIMIT 1),
   'DESSERT', 5)
ON CONFLICT (meal_id, dish_id) DO NOTHING;

-- =========================================
-- FIN DU SCRIPT
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Menus de test ajoutés pour la semaine 1 !';
  RAISE NOTICE '';
  RAISE NOTICE '📅 Dates : 6-10 janvier 2025 (Lundi-Vendredi)';
  RAISE NOTICE '🍽️ Repas : 2 par jour (MIDI + SOIR)';
  RAISE NOTICE '🥗 Chaque repas contient : Entrée, Plat, Garniture, Légume, Dessert';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Rafraîchissez la page web pour voir les emojis ! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Pour vérifier :';
  RAISE NOTICE '   SELECT * FROM public.meals WHERE meal_date >= ''2025-11-17'' AND meal_date <= ''2025-01-10'';';
END $$;
