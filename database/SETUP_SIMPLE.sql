-- =========================================
-- SCRIPT SQL SIMPLE - MENU CAFÉTÉRIA ORIF
-- =========================================
-- 3 tables de menu + 1 table profiles (ce qui marchait avant)
-- =========================================

-- =========================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- =========================================

DROP TABLE IF EXISTS public.meals_dishes CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.dishes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.admin_whitelist CASCADE;

-- Supprimer les anciennes tables (legacy)
DROP TABLE IF EXISTS public.meal_items CASCADE;
DROP TABLE IF EXISTS public.menu_days CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.meal_types CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.allergens CASCADE;

-- Supprimer les types ENUM existants
DROP TYPE IF EXISTS meal_type CASCADE;
DROP TYPE IF EXISTS dish_type CASCADE;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =========================================
-- ÉTAPE 2 : CRÉATION DES TYPES ENUM
-- =========================================

CREATE TYPE meal_type AS ENUM ('MIDI', 'SOIR');

CREATE TYPE dish_type AS ENUM (
  'ENTREE',      -- 🥗 Entrée
  'PLAT',        -- 🍽️ Plat principal
  'GARNITURE',   -- 🥔 Garniture
  'LEGUME',      -- 🥬 Légume
  'DESSERT',     -- 🍰 Dessert
  'AUTRE'        -- ✨ Autre
);

-- =========================================
-- ÉTAPE 3 : TABLE PROFILES
-- =========================================

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  full_name text,
  role text NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'cook', 'viewer')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =========================================
-- ÉTAPE 4 : TABLE DISHES (PLATS)
-- =========================================

CREATE TABLE public.dishes (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  dish_type dish_type NOT NULL DEFAULT 'AUTRE',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dishes_type ON public.dishes (dish_type) WHERE is_active = true;
CREATE INDEX idx_dishes_name ON public.dishes (name) WHERE is_active = true;

-- =========================================
-- ÉTAPE 5 : TABLE MEALS (REPAS)
-- =========================================

CREATE TABLE public.meals (
  id bigserial PRIMARY KEY,
  meal_date date NOT NULL,
  meal_type meal_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (meal_date, meal_type)
);

CREATE INDEX idx_meals_date ON public.meals (meal_date);

-- =========================================
-- ÉTAPE 6 : TABLE MEALS_DISHES (LIAISON)
-- =========================================

CREATE TABLE public.meals_dishes (
  meal_id bigint NOT NULL,
  dish_id bigint NOT NULL,
  dish_type dish_type NOT NULL,
  position int,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (meal_id, dish_id),
  UNIQUE (meal_id, dish_type),
  CONSTRAINT fk_meals_dishes_meal
    FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE,
  CONSTRAINT fk_meals_dishes_dish
    FOREIGN KEY (dish_id) REFERENCES public.dishes(id) ON DELETE CASCADE
);

CREATE INDEX idx_meals_dishes_meal ON public.meals_dishes (meal_id);
CREATE INDEX idx_meals_dishes_dish ON public.meals_dishes (dish_id);

-- =========================================
-- ÉTAPE 7 : ROW LEVEL SECURITY (RLS)
-- =========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals_dishes ENABLE ROW LEVEL SECURITY;

-- POLICIES : PROFILES
CREATE POLICY "profiles_read_own"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- POLICIES : DISHES (PLATS)
CREATE POLICY "dishes_public_read"
  ON public.dishes
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "dishes_admin_write"
  ON public.dishes
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- POLICIES : MEALS (REPAS)
CREATE POLICY "meals_public_read"
  ON public.meals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "meals_admin_write"
  ON public.meals
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- POLICIES : MEALS_DISHES (LIAISONS)
CREATE POLICY "meals_dishes_public_read"
  ON public.meals_dishes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "meals_dishes_admin_write"
  ON public.meals_dishes
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- =========================================
-- ÉTAPE 8 : PROFILS ADMIN
-- =========================================

-- Créer les profils admin pour les comptes existants
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Admin ORIF', 'admin'),
  ('98057cf8-066c-4d97-b363-2db5aae00364', 'Raphael Schmutz', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin',
    full_name = EXCLUDED.full_name;

-- =========================================
-- ÉTAPE 9 : PLATS D'EXEMPLE
-- =========================================

INSERT INTO public.dishes (name, dish_type, is_active) VALUES
  ('Salade verte', 'ENTREE', true),
  ('Salade de tomates', 'ENTREE', true),
  ('Carottes râpées', 'ENTREE', true),
  
  ('Poulet rôti', 'PLAT', true),
  ('Saumon grillé', 'PLAT', true),
  ('Steak haché', 'PLAT', true),
  ('Pâtes bolognaise', 'PLAT', true),
  
  ('Riz', 'GARNITURE', true),
  ('Pommes de terre', 'GARNITURE', true),
  ('Pâtes', 'GARNITURE', true),
  ('Frites', 'GARNITURE', true),
  
  ('Brocoli', 'LEGUME', true),
  ('Haricots verts', 'LEGUME', true),
  ('Carottes', 'LEGUME', true),
  ('Ratatouille', 'LEGUME', true),
  
  ('Tarte aux pommes', 'DESSERT', true),
  ('Mousse au chocolat', 'DESSERT', true),
  ('Yaourt', 'DESSERT', true),
  ('Fruit de saison', 'DESSERT', true),
  
  ('Pain', 'AUTRE', true),
  ('Salade de fruits', 'AUTRE', true)
ON CONFLICT DO NOTHING;

-- =========================================
-- FIN DU SCRIPT
-- =========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Base de données configurée avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables créées :';
  RAISE NOTICE '   - profiles (1 table)';
  RAISE NOTICE '   - dishes, meals, meals_dishes (3 tables de menu)';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Profils admin créés pour :';
  RAISE NOTICE '   - 1ebb59cc-e034-4f09-b8a5-68e07015d11d (Admin ORIF)';
  RAISE NOTICE '   - 98057cf8-066c-4d97-b363-2db5aae00364 (Raphael Schmutz)';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Pour vérifier :';
  RAISE NOTICE '   SELECT * FROM public.profiles;';
  RAISE NOTICE '   SELECT * FROM public.dishes;';
END $$;
