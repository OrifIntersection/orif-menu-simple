-- =====================================================
-- SCRIPT COMPLET - ORIF MENU CAFÉTÉRIA (Supabase/PostgreSQL)
-- À exécuter dans Supabase SQL Editor
-- Aligné avec script_MySQL.sql (structure identique)
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : TABLES (ordre MySQL + syntaxe PostgreSQL)
-- =====================================================

-- 1. Profils utilisateurs (utilise auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','cook','viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Types de repas
CREATE TABLE IF NOT EXISTS public.meal_types (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 3. Catégories
CREATE TABLE IF NOT EXISTS public.categories (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 4. Menus hebdomadaires
CREATE TABLE IF NOT EXISTS public.menus (
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
CREATE TABLE IF NOT EXISTS public.menu_days (
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
CREATE TABLE IF NOT EXISTS public.dishes (
  id bigserial NOT NULL,
  name text NOT NULL,
  description text,
  image_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 7. Allergènes
CREATE TABLE IF NOT EXISTS public.allergens (
  id serial NOT NULL,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  PRIMARY KEY (id)
);

-- 8. Allergènes par plat (N:N)
CREATE TABLE IF NOT EXISTS public.dish_allergens (
  dish_id bigint NOT NULL,
  allergen_id int NOT NULL,
  PRIMARY KEY (dish_id, allergen_id),
  CONSTRAINT fk_da_dish FOREIGN KEY (dish_id)
    REFERENCES public.dishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_da_allergen FOREIGN KEY (allergen_id)
    REFERENCES public.allergens(id)
);

-- 9. Affectation des plats (jour × type × catégorie)
CREATE TABLE IF NOT EXISTS public.menu_items (
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
-- ÉTAPE 2 : INDEX UTILES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_lookup ON public.menu_items (menu_day_id, meal_type_id, category_id);
CREATE INDEX IF NOT EXISTS idx_menus_year_week   ON public.menus (year, week_number);
CREATE INDEX IF NOT EXISTS idx_menu_days_date    ON public.menu_days (day_date);
CREATE INDEX IF NOT EXISTS idx_dishes_active     ON public.dishes (is_active);

-- =====================================================
-- ÉTAPE 3 : DONNÉES DE BASE
-- =====================================================

-- Types de repas
INSERT INTO public.meal_types (code, label) VALUES
  ('MIDI', 'Midi'),
  ('SOIR', 'Soir')
ON CONFLICT (code) DO NOTHING;

-- Catégories
INSERT INTO public.categories (code, label) VALUES
  ('SALADE',   'Salade'),
  ('VIANDE',   'Viande'),
  ('FECULENT', 'Féculent'),
  ('LEGUMES',  'Légumes'),
  ('DESSERT',  'Dessert')
ON CONFLICT (code) DO NOTHING;

-- Allergènes
INSERT INTO public.allergens (code, label) VALUES
  ('GLUTEN','Gluten'),
  ('LACTOSE','Lactose'),
  ('ARACHIDES','Arachides'),
  ('OEUFS','Oeufs'),
  ('POISSON','Poisson'),
  ('SOJA','Soja'),
  ('FRUITS_A_COQUE','Fruits à coque'),
  ('CELERI','Céleri'),
  ('MOUTARDE','Moutarde'),
  ('SESAME','Sésame')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ÉTAPE 4 : PLATS (25 plats : 5 par catégorie)
-- =====================================================

-- Salades
INSERT INTO public.dishes (name, description) VALUES
  ('Salade verte', 'Salade verte fraîche de saison'),
  ('Salade César', 'Salade romaine, croûtons, parmesan, sauce César'),
  ('Carottes râpées', 'Carottes râpées vinaigrette'),
  ('Taboulé', 'Taboulé libanais à la menthe'),
  ('Betteraves', 'Betteraves rouges vinaigrette')
ON CONFLICT DO NOTHING;

-- Viandes
INSERT INTO public.dishes (name, description) VALUES
  ('Poulet rôti', 'Poulet fermier rôti au four avec herbes'),
  ('Steak haché', 'Steak haché pur bœuf'),
  ('Poisson pané', 'Filet de poisson pané croustillant'),
  ('Saucisse de Strasbourg', 'Saucisse traditionnelle'),
  ('Escalope de dinde', 'Escalope de dinde grillée')
ON CONFLICT DO NOTHING;

-- Féculents
INSERT INTO public.dishes (name, description) VALUES
  ('Pâtes', 'Pâtes italiennes al dente'),
  ('Riz', 'Riz blanc parfumé'),
  ('Pommes de terre', 'Pommes de terre vapeur'),
  ('Frites', 'Frites maison croustillantes'),
  ('Purée', 'Purée de pommes de terre maison')
ON CONFLICT DO NOTHING;

-- Légumes
INSERT INTO public.dishes (name, description) VALUES
  ('Haricots verts', 'Haricots verts frais vapeur'),
  ('Courgettes', 'Courgettes sautées à l'ail'),
  ('Brocolis', 'Brocolis vapeur'),
  ('Carottes', 'Carottes glacées au miel'),
  ('Ratatouille', 'Ratatouille provençale')
ON CONFLICT DO NOTHING;

-- Desserts
INSERT INTO public.dishes (name, description) VALUES
  ('Yaourt', 'Yaourt nature ou aux fruits'),
  ('Compote', 'Compote de pommes maison'),
  ('Fruit', 'Fruit frais de saison'),
  ('Mousse au chocolat', 'Mousse au chocolat onctueuse'),
  ('Tarte aux pommes', 'Tarte aux pommes traditionnelle')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÉTAPE 5 : MENU SEMAINE 45/2025 (4-8 novembre)
-- =====================================================

-- Menu principal
INSERT INTO public.menus (year, week_number, week_label, start_date, end_date)
VALUES (2025, 45, '4 au 8 novembre 2025', '2025-11-04', '2025-11-08')
ON CONFLICT (year, week_number) DO NOTHING;

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
WHERE m.year = 2025 AND m.week_number = 45
ON CONFLICT (menu_id, day_name) DO NOTHING;

-- =====================================================
-- ÉTAPE 6 : REMPLISSAGE MENU (50 items)
-- =====================================================

-- LUNDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet rôti') OR
  (c.code='FECULENT' AND d.name='Pâtes') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- LUNDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Carottes râpées') OR
  (c.code='VIANDE'   AND d.name='Steak haché') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- MARDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade César') OR
  (c.code='VIANDE'   AND d.name='Poisson pané') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- MARDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Taboulé') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Purée') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- MERCREDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- MERCREDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet rôti') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- JEUDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Carottes râpées') OR
  (c.code='VIANDE'   AND d.name='Steak haché') OR
  (c.code='FECULENT' AND d.name='Pâtes') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- JEUDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade César') OR
  (c.code='VIANDE'   AND d.name='Poisson pané') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- VENDREDI MIDI
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Taboulé') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Purée') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- VENDREDI SOIR
INSERT INTO public.menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM public.menu_days md
CROSS JOIN public.meal_types mt
CROSS JOIN public.categories c
CROSS JOIN public.dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
)
ON CONFLICT (menu_day_id, meal_type_id, category_id) DO NOTHING;

-- =====================================================
-- ÉTAPE 7 : ROW LEVEL SECURITY (RLS)
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

-- Policies de LECTURE PUBLIQUE (anonyme + authentifié)
CREATE POLICY "public_read_menus" ON public.menus
  FOR SELECT USING (true);

CREATE POLICY "public_read_menu_days" ON public.menu_days
  FOR SELECT USING (true);

CREATE POLICY "public_read_menu_items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "public_read_dishes" ON public.dishes
  FOR SELECT USING (true);

CREATE POLICY "public_read_meal_types" ON public.meal_types
  FOR SELECT USING (true);

CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "public_read_allergens" ON public.allergens
  FOR SELECT USING (true);

CREATE POLICY "public_read_dish_allergens" ON public.dish_allergens
  FOR SELECT USING (true);

-- Policies d'ÉCRITURE (admin/cook uniquement)
CREATE POLICY "admins_cooks_write_menus" ON public.menus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cook')
    )
  );

CREATE POLICY "admins_cooks_write_menu_days" ON public.menu_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cook')
    )
  );

CREATE POLICY "admins_cooks_write_menu_items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cook')
    )
  );

CREATE POLICY "admins_cooks_write_dishes" ON public.dishes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cook')
    )
  );

-- Policy pour profiles
CREATE POLICY "users_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins_write_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- ÉTAPE 8 : FONCTION HELPER (génération semaine)
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_menu_week(
  p_year int,
  p_week_number int,
  p_week_label text,
  p_start_date date
)
RETURNS bigint AS $$
DECLARE
  v_menu_id bigint;
  v_end_date date := p_start_date + INTERVAL '4 days';
BEGIN
  -- Créer le menu
  INSERT INTO public.menus (year, week_number, week_label, start_date, end_date)
  VALUES (p_year, p_week_number, p_week_label, p_start_date, v_end_date)
  RETURNING id INTO v_menu_id;
  
  -- Créer les 5 jours automatiquement
  INSERT INTO public.menu_days (menu_id, day_name, day_date)
  SELECT 
    v_menu_id,
    day_name,
    p_start_date + (ordinality - 1) * INTERVAL '1 day'
  FROM UNNEST(
    ARRAY['Lundi','Mardi','Mercredi','Jeudi','Vendredi']
  ) WITH ORDINALITY AS t(day_name, ordinality);
  
  RETURN v_menu_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ✅ FIN : Supabase prêt avec RLS + Fonction helper
-- - 9 tables (profiles utilise auth.users de Supabase)
-- - Données de base + menu semaine 45/2025
-- - RLS activé avec 12 policies
-- - Fonction generate_menu_week() disponible
-- =====================================================
