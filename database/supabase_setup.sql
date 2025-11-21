-- =========================================
-- SCRIPT SQL COMPLET - MENU CAFÉTÉRIA ORIF
-- =========================================
-- Ce script configure TOUTE la base de données en une seule fois :
-- 1. Nettoyage complet
-- 2. Création des ENUM et tables
-- 3. Row Level Security (RLS)
-- 4. Trigger de création automatique des profils
-- 5. Whitelist admin automatique (optionnel)
-- 6. Données d'exemple
--
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =========================================

-- =========================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- =========================================

-- Supprimer les tables existantes
DROP TABLE IF EXISTS public.meals_dishes CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.dishes CASCADE;
DROP TABLE IF EXISTS public.admin_whitelist CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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

-- Supprimer les fonctions/triggers existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =========================================
-- ÉTAPE 2 : CRÉATION DES TYPES ENUM
-- =========================================

-- Type pour les repas (Midi ou Soir)
CREATE TYPE meal_type AS ENUM ('MIDI', 'SOIR');

-- Type pour les catégories de plats
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
-- ÉTAPE 4 : TABLE ADMIN WHITELIST
-- =========================================

CREATE TABLE public.admin_whitelist (
  email text PRIMARY KEY,
  added_at timestamptz DEFAULT now()
);

-- =========================================
-- ÉTAPE 5 : TABLE DISHES (PLATS)
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

-- Index pour recherche rapide
CREATE INDEX idx_dishes_type ON public.dishes (dish_type) WHERE is_active = true;
CREATE INDEX idx_dishes_name ON public.dishes (name) WHERE is_active = true;

-- =========================================
-- ÉTAPE 6 : TABLE MEALS (REPAS)
-- =========================================

CREATE TABLE public.meals (
  id bigserial PRIMARY KEY,
  meal_date date NOT NULL,
  meal_type meal_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (meal_date, meal_type)
);

-- Index pour recherche rapide
CREATE INDEX idx_meals_date ON public.meals (meal_date);

-- =========================================
-- ÉTAPE 7 : TABLE MEALS_DISHES (LIAISON)
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

-- Index pour optimisation
CREATE INDEX idx_meals_dishes_meal ON public.meals_dishes (meal_id);
CREATE INDEX idx_meals_dishes_dish ON public.meals_dishes (dish_id);

-- =========================================
-- ÉTAPE 8 : TRIGGER CRÉATION AUTO PROFILS
-- =========================================

-- Fonction qui crée automatiquement un profil pour chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text := 'viewer';
BEGIN
  -- Vérifier si l'email est dans la whitelist admin
  IF EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = NEW.email) THEN
    user_role := 'admin';
  END IF;

  -- Créer le profil utilisateur
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- ÉTAPE 9 : ROW LEVEL SECURITY (RLS)
-- =========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals_dishes ENABLE ROW LEVEL SECURITY;

-- =========================================
-- POLICIES : PROFILES
-- =========================================

-- Lecture : chaque utilisateur voit uniquement son profil
CREATE POLICY "profiles_read_own"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Mise à jour : chaque utilisateur modifie uniquement son profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insertion : chaque utilisateur crée uniquement son profil
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =========================================
-- POLICIES : ADMIN_WHITELIST
-- =========================================

-- Seuls les admins peuvent voir et modifier la whitelist
CREATE POLICY "admin_whitelist_admin_only"
  ON public.admin_whitelist
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
-- POLICIES : DISHES (PLATS)
-- =========================================

-- Lecture publique : tout le monde peut voir les plats actifs
CREATE POLICY "dishes_public_read"
  ON public.dishes
  FOR SELECT
  TO public
  USING (is_active = true);

-- Écriture admin : seuls les admins peuvent modifier les plats
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

-- =========================================
-- POLICIES : MEALS (REPAS)
-- =========================================

-- Lecture publique : tout le monde peut voir les repas
CREATE POLICY "meals_public_read"
  ON public.meals
  FOR SELECT
  TO public
  USING (true);

-- Écriture admin : seuls les admins peuvent créer/modifier les repas
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

-- =========================================
-- POLICIES : MEALS_DISHES (LIAISONS)
-- =========================================

-- Lecture publique : tout le monde peut voir les liaisons
CREATE POLICY "meals_dishes_public_read"
  ON public.meals_dishes
  FOR SELECT
  TO public
  USING (true);

-- Écriture admin : seuls les admins peuvent modifier les liaisons
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
-- ÉTAPE 10 : DONNÉES INITIALES
-- =========================================

-- PARTIE A : Whitelist pour les FUTURS admins
-- Toute personne avec un email dans cette liste deviendra
-- automatiquement ADMIN à sa première connexion.
INSERT INTO public.admin_whitelist (email) VALUES
  ('raphael.schmutz@orif.ch'),
  ('aayyyeesh@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- PARTIE B : Profils pour les comptes EXISTANTS
-- Pour les comptes qui existent déjà, on crée directement le profil admin
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Admin ORIF', 'admin'),
  ('98057cf8-066c-4d97-b363-2db5aae00364', 'Raphael Schmutz', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin',
    full_name = EXCLUDED.full_name;

-- Exemples de plats pour tester (optionnel)
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

-- Vérification de la configuration
DO $$
BEGIN
  RAISE NOTICE '✅ Base de données configurée avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes :';
  RAISE NOTICE '1. Modifiez la whitelist admin (ligne 306) avec vos vrais emails';
  RAISE NOTICE '2. Connectez-vous à l''application avec votre email';
  RAISE NOTICE '3. Vous serez automatiquement admin grâce à la whitelist';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Pour vérifier :';
  RAISE NOTICE '   SELECT * FROM public.admin_whitelist;';
  RAISE NOTICE '   SELECT * FROM public.profiles;';
  RAISE NOTICE '   SELECT * FROM public.dishes;';
END $$;


































-- =========================================
-- SCRIPT SQL COMPLET - MENU CAFÉTÉRIA ORIF
-- =========================================
-- Ce script configure TOUTE la base de données en une seule fois :
-- 1. Nettoyage complet
-- 2. Création des ENUM et tables
-- 3. Row Level Security (RLS)
-- 4. Trigger de création automatique des profils
-- 5. Whitelist admin automatique (optionnel)
-- 6. Données d'exemple
--
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =========================================

-- =========================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- =========================================

-- Supprimer les tables existantes
DROP TABLE IF EXISTS public.meals_dishes CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.dishes CASCADE;
DROP TABLE IF EXISTS public.admin_whitelist CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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

-- Supprimer les fonctions/triggers existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =========================================
-- ÉTAPE 2 : CRÉATION DES TYPES ENUM
-- =========================================

-- Type pour les repas (Midi ou Soir)
CREATE TYPE meal_type AS ENUM ('MIDI', 'SOIR');

-- Type pour les catégories de plats
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
-- ÉTAPE 4 : TABLE ADMIN WHITELIST
-- =========================================

CREATE TABLE public.admin_whitelist (
  email text PRIMARY KEY,
  added_at timestamptz DEFAULT now()
);

-- =========================================
-- ÉTAPE 5 : TABLE DISHES (PLATS)
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

-- Index pour recherche rapide
CREATE INDEX idx_dishes_type ON public.dishes (dish_type) WHERE is_active = true;
CREATE INDEX idx_dishes_name ON public.dishes (name) WHERE is_active = true;

-- =========================================
-- ÉTAPE 6 : TABLE MEALS (REPAS)
-- =========================================

CREATE TABLE public.meals (
  id bigserial PRIMARY KEY,
  meal_date date NOT NULL,
  meal_type meal_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (meal_date, meal_type)
);

-- Index pour recherche rapide
CREATE INDEX idx_meals_date ON public.meals (meal_date);

-- =========================================
-- ÉTAPE 7 : TABLE MEALS_DISHES (LIAISON)
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

-- Index pour optimisation
CREATE INDEX idx_meals_dishes_meal ON public.meals_dishes (meal_id);
CREATE INDEX idx_meals_dishes_dish ON public.meals_dishes (dish_id);

-- =========================================
-- ÉTAPE 8 : TRIGGER CRÉATION AUTO PROFILS
-- =========================================

-- Fonction qui crée automatiquement un profil pour chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text := 'viewer';
BEGIN
  -- Vérifier si l'email est dans la whitelist admin
  IF EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = NEW.email) THEN
    user_role := 'admin';
  END IF;

  -- Créer le profil utilisateur
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- ÉTAPE 9 : ROW LEVEL SECURITY (RLS)
-- =========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals_dishes ENABLE ROW LEVEL SECURITY;

-- =========================================
-- POLICIES : PROFILES
-- =========================================

-- Lecture : chaque utilisateur voit uniquement son profil
CREATE POLICY "profiles_read_own"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Mise à jour : chaque utilisateur modifie uniquement son profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insertion : chaque utilisateur crée uniquement son profil
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =========================================
-- POLICIES : ADMIN_WHITELIST
-- =========================================

-- Seuls les admins peuvent voir et modifier la whitelist
CREATE POLICY "admin_whitelist_admin_only"
  ON public.admin_whitelist
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
-- POLICIES : DISHES (PLATS)
-- =========================================

-- Lecture publique : tout le monde peut voir les plats actifs
CREATE POLICY "dishes_public_read"
  ON public.dishes
  FOR SELECT
  TO public
  USING (is_active = true);

-- Écriture admin : seuls les admins peuvent modifier les plats
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

-- =========================================
-- POLICIES : MEALS (REPAS)
-- =========================================

-- Lecture publique : tout le monde peut voir les repas
CREATE POLICY "meals_public_read"
  ON public.meals
  FOR SELECT
  TO public
  USING (true);

-- Écriture admin : seuls les admins peuvent créer/modifier les repas
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

-- =========================================
-- POLICIES : MEALS_DISHES (LIAISONS)
-- =========================================

-- Lecture publique : tout le monde peut voir les liaisons
CREATE POLICY "meals_dishes_public_read"
  ON public.meals_dishes
  FOR SELECT
  TO public
  USING (true);

-- Écriture admin : seuls les admins peuvent modifier les liaisons
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
-- ÉTAPE 10 : DONNÉES INITIALES
-- =========================================

-- PARTIE A : Whitelist pour les FUTURS admins
-- Toute personne avec un email dans cette liste deviendra
-- automatiquement ADMIN à sa première connexion.
INSERT INTO public.admin_whitelist (email) VALUES
  ('raphael.schmutz@orif.ch'),
  ('aayyyeesh@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- PARTIE B : Profils pour les comptes EXISTANTS
-- Pour les comptes qui existent déjà, on crée directement le profil admin
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Admin ORIF', 'admin'),
  ('98057cf8-066c-4d97-b363-2db5aae00364', 'Raphael Schmutz', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin',
    full_name = EXCLUDED.full_name;

-- Exemples de plats pour tester (optionnel)
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

-- Vérification de la configuration
DO $$
BEGIN
  RAISE NOTICE '✅ Base de données configurée avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes :';
  RAISE NOTICE '1. Modifiez la whitelist admin (ligne 306) avec vos vrais emails';
  RAISE NOTICE '2. Connectez-vous à l''application avec votre email';
  RAISE NOTICE '3. Vous serez automatiquement admin grâce à la whitelist';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Pour vérifier :';
  RAISE NOTICE '   SELECT * FROM public.admin_whitelist;';
  RAISE NOTICE '   SELECT * FROM public.profiles;';
  RAISE NOTICE '   SELECT * FROM public.dishes;';
END $$;
























-- =========================================
-- SCRIPT UNIQUE : RESET + RECREATION MINIMALE
-- =========================================

-- 0. RESET : supprimer les tables si elles existent
DROP TABLE IF EXISTS public.meal_items CASCADE;
DROP TABLE IF EXISTS public.menu_days CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.meal_types CASCADE;
DROP TABLE IF EXISTS public.allergens CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =========================================
-- 1. TABLE profiles (liee a auth.users)
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
-- 2. TABLE meal_types
-- =========================================
CREATE TABLE public.meal_types (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL
);

-- =========================================
-- 3. TABLE menus (par semaine)
-- =========================================
CREATE TABLE public.menus (
  id bigserial PRIMARY KEY,
  year int NOT NULL,
  week_number int NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  week_label text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  UNIQUE (year, week_number)
);

-- =========================================
-- 4. TABLE menu_days (jours d'un menu)
-- =========================================
CREATE TABLE public.menu_days (
  id bigserial PRIMARY KEY,
  menu_id bigint NOT NULL,
  day_name text NOT NULL CHECK (day_name IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi')),
  day_date date NOT NULL,
  UNIQUE (menu_id, day_name),
  CONSTRAINT fk_menu_days_menu
    FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE
);

-- =========================================
-- 5. TABLE allergens
-- =========================================
CREATE TABLE public.allergens (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL
);

-- =========================================
-- 6. TABLE categories (facultatif mais attendu par le front)
-- =========================================
CREATE TABLE public.categories (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL
);

-- =========================================
-- 7. TABLE meal_items (affectation directe des plats)
--    ⚠ il faut que public.dishes existe deja
-- =========================================
CREATE TABLE public.meal_items (
  id bigserial PRIMARY KEY,
  date date NOT NULL,
  meal_type_id int NOT NULL,
  category_id int,          -- optionnel, peut rester NULL
  dish_id bigint NOT NULL,
  meal_label text,          -- DEVient facultatif (plus de NOT NULL)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT fk_meal_items_type
    FOREIGN KEY (meal_type_id) REFERENCES public.meal_types(id),

  CONSTRAINT fk_meal_items_dish
    FOREIGN KEY (dish_id) REFERENCES public.dishes(id),

  CONSTRAINT fk_meal_items_category
    FOREIGN KEY (category_id) REFERENCES public.categories(id),

  -- ⚠ correspond au on_conflict=date,meal_type_id,dish_id
  CONSTRAINT unique_meal_assignment
    UNIQUE (date, meal_type_id, dish_id)
);

-- =========================================
-- INDEX
-- =========================================
CREATE INDEX idx_meal_items_date  ON public.meal_items (date);
CREATE INDEX idx_menus_year_week  ON public.menus (year, week_number);
CREATE INDEX idx_menu_days_date   ON public.menu_days (day_date);

-- =========================================
-- DONNEES DE BASE
-- =========================================
INSERT INTO public.meal_types (code, label) VALUES
  ('MIDI', 'Midi'),
  ('SOIR', 'Soir')
ON CONFLICT (code) DO NOTHING;

-- (optionnel) categories de base
INSERT INTO public.categories (code, label) VALUES
  ('ENTREE',  'Entree'),
  ('PLAT',    'Plat principal'),
  ('GARNIT',  'Garniture'),
  ('LEGUMES', 'Legumes'),
  ('DESSERT', 'Dessert')
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- RLS
-- =========================================
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_days   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes policies
DROP POLICY IF EXISTS "public_read_menus"        ON public.menus;
DROP POLICY IF EXISTS "public_read_menu_days"    ON public.menu_days;
DROP POLICY IF EXISTS "public_read_meal_items"   ON public.meal_items;
DROP POLICY IF EXISTS "admin_write_meal_items"   ON public.meal_items;
DROP POLICY IF EXISTS "public_read_meal_types"   ON public.meal_types;
DROP POLICY IF EXISTS "public_read_allergens"    ON public.allergens;
DROP POLICY IF EXISTS "public_read_categories"   ON public.categories;
DROP POLICY IF EXISTS "profiles_read_own"        ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"      ON public.profiles;

-- Politiques de lecture publiques
CREATE POLICY "public_read_menus"
  ON public.menus
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_menu_days"
  ON public.menu_days
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_meal_items"
  ON public.meal_items
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_meal_types"
  ON public.meal_types
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_allergens"
  ON public.allergens
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_categories"
  ON public.categories
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

-- Ecriture libre sur meal_items (a securiser plus tard)
CREATE POLICY "admin_write_meal_items"
  ON public.meal_items
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true);

-- =========================================
-- RLS sur profiles
-- =========================================

-- Lecture : l'utilisateur voit son profil, l'admin voit tout
CREATE POLICY "profiles_read_own"
  ON public.profiles
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (
    auth.uid() = user_id
    OR exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Update : meme logique (own + admin)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (
    auth.uid() = user_id
    OR exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Insert : chaque utilisateur cree son propre profil
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);



-- Nettoyer les anciennes policies qui posent probleme
DROP POLICY IF EXISTS "profiles_read_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Lecture : chaque user lit uniquement SON profil
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;

CREATE POLICY "profiles_read_own"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Update : chaque user modifie uniquement SON profil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- PROFILS ADMIN
-- =========================================
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Admin ORIF', 'admin'),
  ('98057cf8-066c-4d97-b363-2db5aae00364', 'Admin 2',     'admin')
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role      = 'admin';
