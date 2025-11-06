-- =====================================================
-- SCRIPT COMPLET - ORIF MENU CAFETERIA (Supabase/PostgreSQL)
-- Version sans accents pour eviter les erreurs de syntaxe
-- =====================================================

-- Supprimer les tables existantes si elles existent (nettoyage)
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_days CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.dish_allergens CASCADE;
DROP TABLE IF EXISTS public.dishes CASCADE;
DROP TABLE IF EXISTS public.allergens CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.meal_types CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- ETAPE 1 : TABLES (ordre MySQL + syntaxe PostgreSQL)
-- =====================================================

-- 1. Profils utilisateurs (utilise auth.users de Supabase)
CREATE TABLE public.profiles (
  user_id uuid NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','cook','viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Types de repas
CREATE TABLE public.meal_types (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 3. Categories
CREATE TABLE public.categories (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 4. Menus hebdomadaires
CREATE TABLE public.menus (
  id bigserial NOT NULL,
  year int NOT NULL,
  week_number int NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  week_label text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (year, week_number)
);

-- 5. Jours d'un menu
CREATE TABLE public.menu_days (
  id bigserial NOT NULL,
  menu_id bigint NOT NULL,
  day_name text NOT NULL CHECK (day_name IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi')),
  day_date date NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (menu_id, day_name),
  CONSTRAINT fk_menu_days_menu FOREIGN KEY (menu_id)
    REFERENCES public.menus(id) ON DELETE CASCADE
);

-- 6. Catalogue des plats
CREATE TABLE public.dishes (
  id bigserial NOT NULL,
  name text NOT NULL,
  description text,
  image_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 7. Allergenes
CREATE TABLE public.allergens (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 8. Allergenes par plat (N:N)
CREATE TABLE public.dish_allergens (
  dish_id bigint NOT NULL,
  allergen_id int NOT NULL,
  PRIMARY KEY (dish_id, allergen_id),
  CONSTRAINT fk_da_dish FOREIGN KEY (dish_id)
    REFERENCES public.dishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_da_allergen FOREIGN KEY (allergen_id)
    REFERENCES public.allergens(id)
);

-- 9. Affectation des plats (jour × type × categorie)
CREATE TABLE public.menu_items (
  id bigserial NOT NULL,
  menu_day_id bigint NOT NULL,
  meal_type_id int NOT NULL,
  category_id int NOT NULL,
  dish_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (menu_day_id, meal_type_id, category_id),
  CONSTRAINT fk_menu_items_day  FOREIGN KEY (menu_day_id) REFERENCES public.menu_days(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_items_meal FOREIGN KEY (meal_type_id) REFERENCES public.meal_types(id),
  CONSTRAINT fk_menu_items_cat  FOREIGN KEY (category_id)  REFERENCES public.categories(id),
  CONSTRAINT fk_menu_items_dish FOREIGN KEY (dish_id)      REFERENCES public.dishes(id)
);

-- =====================================================
-- ETAPE 2 : INDEX UTILES
-- =====================================================
CREATE INDEX idx_menu_items_lookup ON public.menu_items (menu_day_id, meal_type_id, category_id);
CREATE INDEX idx_menus_year_week   ON public.menus (year, week_number);
CREATE INDEX idx_menu_days_date    ON public.menu_days (day_date);
CREATE INDEX idx_dishes_active     ON public.dishes (is_active);

-- =====================================================
-- ETAPE 3 : DONNEES DE BASE
-- =====================================================

-- Types de repas
INSERT INTO public.meal_types (code, label) VALUES
  ('MIDI', 'Midi'),
  ('SOIR', 'Soir');

-- Categories
INSERT INTO public.categories (code, label) VALUES
  ('SALADE',   'Salade'),
  ('VIANDE',   'Viande'),
  ('FECULENT', 'Feculent'),
  ('LEGUMES',  'Legumes'),
  ('DESSERT',  'Dessert');

-- Allergenes
INSERT INTO public.allergens (code, label) VALUES
  ('GLUTEN','Gluten'),
  ('LACTOSE','Lactose'),
  ('ARACHIDES','Arachides'),
  ('OEUFS','Oeufs'),
  ('POISSON','Poisson'),
  ('SOJA','Soja'),
  ('FRUITS_A_COQUE','Fruits a coque'),
  ('CELERI','Celeri'),
  ('MOUTARDE','Moutarde'),
  ('SESAME','Sesame');

-- =====================================================
-- ETAPE 4 : PLATS (25 plats : 5 par categorie)
-- =====================================================

-- Salades
INSERT INTO public.dishes (name, description) VALUES
  ('Salade verte', 'Salade verte fraiche de saison'),
  ('Salade Cesar', 'Salade romaine, croutons, parmesan, sauce Cesar'),
  ('Carottes rapees', 'Carottes rapees vinaigrette'),
  ('Taboule', 'Taboule libanais a la menthe'),
  ('Betteraves', 'Betteraves rouges vinaigrette');

-- Viandes
INSERT INTO public.dishes (name, description) VALUES
  ('Poulet roti', 'Poulet fermier roti au four avec herbes'),
  ('Steak hache', 'Steak hache pur boeuf'),
  ('Poisson pane', 'Filet de poisson pane croustillant'),
  ('Saucisse de Strasbourg', 'Saucisse traditionnelle'),
  ('Escalope de dinde', 'Escalope de dinde grillee');

-- Feculents
INSERT INTO public.dishes (name, description) VALUES
  ('Pates', 'Pates italiennes al dente'),
  ('Riz', 'Riz blanc parfume'),
  ('Pommes de terre', 'Pommes de terre vapeur'),
  ('Frites', 'Frites maison croustillantes'),
  ('Puree', 'Puree de pommes de terre maison');

-- Legumes
INSERT INTO public.dishes (name, description) VALUES
  ('Haricots verts', 'Haricots verts frais vapeur'),
  ('Courgettes', 'Courgettes sautees a l ail'),
  ('Brocolis', 'Brocolis vapeur'),
  ('Carottes', 'Carottes glacees au miel'),
  ('Ratatouille', 'Ratatouille provencale');

-- Desserts
INSERT INTO public.dishes (name, description) VALUES
  ('Yaourt', 'Yaourt nature ou aux fruits'),
  ('Compote', 'Compote de pommes maison'),
  ('Fruit', 'Fruit frais de saison'),
  ('Mousse au chocolat', 'Mousse au chocolat onctueuse'),
  ('Tarte aux pommes', 'Tarte aux pommes traditionnelle');

-- =====================================================
-- ETAPE 5 : MENU SEMAINE 45/2025 (4-8 novembre)
-- =====================================================

-- Menu principal
INSERT INTO public.menus (year, week_number, week_label, start_date, end_date)
VALUES (2025, 45, '4 au 8 novembre 2025', '2025-11-04', '2025-11-08');

-- Les 5 jours
INSERT INTO public.menu_days (menu_id, day_name, day_date)
SELECT m.id, t.day_name, t.day_date
FROM public.menus m
CROSS JOIN (
  SELECT 'Lundi' AS day_name,    '2025-11-04'::date AS day_date UNION ALL
  SELECT 'Mardi',                '2025-11-05'::date           UNION ALL
  SELECT 'Mercredi',             '2025-11-06'::date           UNION ALL
  SELECT 'Jeudi',                '2025-11-07'::date           UNION ALL
  SELECT 'Vendredi',             '2025-11-08'::date
) AS t
WHERE m.year = 2025 AND m.week_number = 45;

-- =====================================================
-- ETAPE 6 : REMPLISSAGE MENU (50 items)
-- =====================================================

-- LUNDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet roti') OR
  (c.code='FECULENT' AND d.name='Pates') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
);

-- LUNDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Carottes rapees') OR
  (c.code='VIANDE'   AND d.name='Steak hache') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
);

-- MARDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade Cesar') OR
  (c.code='VIANDE'   AND d.name='Poisson pane') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
);

-- MARDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Taboule') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Puree') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
);

-- MERCREDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
);

-- MERCREDI SOIR  
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet roti') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
);

-- JEUDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Carottes rapees') OR
  (c.code='VIANDE'   AND d.name='Steak hache') OR
  (c.code='FECULENT' AND d.name='Pates') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
);

-- JEUDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade Cesar') OR
  (c.code='VIANDE'   AND d.name='Poisson pane') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
);

-- VENDREDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Taboule') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Puree') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
);

-- VENDREDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md, public.meal_types mt, public.categories c, public.dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
);

-- =====================================================
-- ETAPE 7 : ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_allergens ENABLE ROW LEVEL SECURITY;

-- Policies de LECTURE PUBLIQUE (anonyme + authentifie)
CREATE POLICY "public_read_menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "public_read_menu_days" ON public.menu_days FOR SELECT USING (true);
CREATE POLICY "public_read_menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "public_read_dishes" ON public.dishes FOR SELECT USING (true);
CREATE POLICY "public_read_meal_types" ON public.meal_types FOR SELECT USING (true);
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public_read_allergens" ON public.allergens FOR SELECT USING (true);
CREATE POLICY "public_read_dish_allergens" ON public.dish_allergens FOR SELECT USING (true);

-- =====================================================
-- FIN : Supabase pret pour test
-- =====================================================