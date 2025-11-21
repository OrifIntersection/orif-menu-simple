-- =========================================
-- MIGRATION : STRUCTURE SIMPLIFIÉE AVEC ENUMS
-- =========================================
-- Cette migration crée une structure de base de données simplifiée
-- utilisant des ENUMs pour les types de repas et de plats.
--
-- Structure finale :
--   - dishes : tous les plats avec leur type (enum dish_type)
--   - meals : instances de repas (date + type midi/soir)
--   - meals_dishes : liaison entre meals et dishes
--   - profiles : profils utilisateurs avec rôles
--
-- =========================================

-- =========================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- =========================================
-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS public.meals_dishes CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.dishes CASCADE;
DROP TABLE IF EXISTS public.meal_items CASCADE;
DROP TABLE IF EXISTS public.menu_days CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.meal_types CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.allergens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les anciens types ENUM si ils existent
DROP TYPE IF EXISTS meal_type CASCADE;
DROP TYPE IF EXISTS dish_type CASCADE;

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
-- Profils utilisateurs liés aux comptes auth.users
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
-- Tous les plats disponibles avec leur type
CREATE TABLE public.dishes (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  dish_type dish_type NOT NULL DEFAULT 'AUTRE',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour rechercher rapidement les plats actifs par type
CREATE INDEX idx_dishes_type ON public.dishes (dish_type) WHERE is_active = true;
CREATE INDEX idx_dishes_name ON public.dishes (name) WHERE is_active = true;

-- =========================================
-- ÉTAPE 5 : TABLE MEALS (REPAS)
-- =========================================
-- Instances de repas identifiées par date et type
CREATE TABLE public.meals (
  id bigserial PRIMARY KEY,
  meal_date date NOT NULL,
  meal_type meal_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (meal_date, meal_type)
);

-- Index pour rechercher rapidement les repas par date
CREATE INDEX idx_meals_date ON public.meals (meal_date);

-- =========================================
-- ÉTAPE 6 : TABLE MEALS_DISHES (LIAISON)
-- =========================================
-- Liaison entre les repas et les plats
-- IMPORTANT: dish_type est dénormalisé ici pour permettre la contrainte UNIQUE (meal_id, dish_type)
-- Cela garantit qu'un repas ne peut avoir qu'un seul plat de chaque type
CREATE TABLE public.meals_dishes (
  meal_id bigint NOT NULL,
  dish_id bigint NOT NULL,
  dish_type dish_type NOT NULL,  -- Dénormalisé pour contrainte UNIQUE
  position int,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (meal_id, dish_id),
  UNIQUE (meal_id, dish_type),  -- Garantit l'unicité par type de plat
  CONSTRAINT fk_meals_dishes_meal
    FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE,
  CONSTRAINT fk_meals_dishes_dish
    FOREIGN KEY (dish_id) REFERENCES public.dishes(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_meals_dishes_meal ON public.meals_dishes (meal_id);
CREATE INDEX idx_meals_dishes_dish ON public.meals_dishes (dish_id);

-- =========================================
-- ÉTAPE 7 : ROW LEVEL SECURITY (RLS)
-- =========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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
-- ÉTAPE 8 : DONNÉES DE BASE
-- =========================================

-- Insérer les profils admin (remplacer par vos vrais UUIDs)
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Admin ORIF', 'admin'),
  ('98057cf8-066c-4d97-b363-2db5aae00364', 'Admin 2', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = 'admin';

-- =========================================
-- ÉTAPE 9 : DONNÉES EXEMPLES (OPTIONNEL)
-- =========================================

-- Exemples de plats pour tester
INSERT INTO public.dishes (name, dish_type, is_active) VALUES
  ('Salade verte', 'ENTREE', true),
  ('Salade de tomates', 'ENTREE', true),
  ('Poulet rôti', 'PLAT', true),
  ('Saumon grillé', 'PLAT', true),
  ('Riz', 'GARNITURE', true),
  ('Pommes de terre', 'GARNITURE', true),
  ('Brocoli', 'LEGUME', true),
  ('Haricots verts', 'LEGUME', true),
  ('Tarte aux pommes', 'DESSERT', true),
  ('Mousse au chocolat', 'DESSERT', true)
ON CONFLICT DO NOTHING;

-- =========================================
-- FIN DE LA MIGRATION
-- =========================================
-- La structure est maintenant prête à recevoir des données
-- de production via l'interface d'administration.
--
-- Pour créer un menu :
-- 1. Créer un meal : INSERT INTO meals (meal_date, meal_type) VALUES ('2025-11-21', 'MIDI')
-- 2. Créer/récupérer des plats : INSERT INTO dishes (name, dish_type) VALUES ('Salade', 'ENTREE')
-- 3. Lier les plats au meal : INSERT INTO meals_dishes (meal_id, dish_id) VALUES (1, 1)
--
-- Les requêtes frontend utiliseront :
-- SELECT meals.*, meals_dishes.*, dishes.*
-- FROM meals
-- JOIN meals_dishes ON meals.id = meals_dishes.meal_id
-- JOIN dishes ON meals_dishes.dish_id = dishes.id
-- WHERE meals.meal_date = '2025-11-21'
-- =========================================
