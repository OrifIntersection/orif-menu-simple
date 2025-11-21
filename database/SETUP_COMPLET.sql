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
