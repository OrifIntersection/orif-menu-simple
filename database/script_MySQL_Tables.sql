/* =====================================================
   SCRIPT COMPLET - ORIF MENU CAFETERIA (compat. Workbench)
   Version sans accents - alignee avec supabase_setup_clean.sql
   ===================================================== */

-- =====================================================
-- ETAPE 0 : CREATION DE LA BASE
-- =====================================================
DROP DATABASE IF EXISTS cafet;
CREATE DATABASE cafet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafet;

-- Encodage session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- ETAPE 1 : TABLES (format "classique" pour ERD Workbench)
-- =====================================================

-- 1. Table auth (stub)
CREATE TABLE auth_users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Profils (1:1 avec auth_users)
CREATE TABLE profiles (
  user_id CHAR(36) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin','cook','viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
    REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Types de repas
CREATE TABLE meal_types (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL UNIQUE,
  label VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Categories
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL UNIQUE,
  label VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Menus hebdomadaires
CREATE TABLE menus (
  id BIGINT NOT NULL AUTO_INCREMENT,
  year INT NOT NULL,
  week_number INT NOT NULL,
  week_label VARCHAR(128),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_menus_year_week (year, week_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Jours d'un menu
CREATE TABLE menu_days (
  id BIGINT NOT NULL AUTO_INCREMENT,
  menu_id BIGINT NOT NULL,
  day_name ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
  day_date DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_menu_days_menu_day (menu_id, day_name),
  CONSTRAINT fk_menu_days_menu FOREIGN KEY (menu_id)
    REFERENCES menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Catalogue des plats
CREATE TABLE dishes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  image_path VARCHAR(512),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Allergenes
CREATE TABLE allergens (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Allergenes par plat (N:N)
CREATE TABLE dish_allergens (
  dish_id BIGINT NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (dish_id, allergen_id),
  CONSTRAINT fk_da_dish FOREIGN KEY (dish_id)
    REFERENCES dishes(id) ON DELETE CASCADE,
  CONSTRAINT fk_da_allergen FOREIGN KEY (allergen_id)
    REFERENCES allergens(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Affectation des plats (jour × type × categorie)
CREATE TABLE menu_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  menu_day_id BIGINT NOT NULL,
  meal_type_id INT NOT NULL,
  category_id INT NOT NULL,
  dish_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_menu_items_day_meal_cat (menu_day_id, meal_type_id, category_id),
  CONSTRAINT fk_menu_items_day  FOREIGN KEY (menu_day_id) REFERENCES menu_days(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_items_meal FOREIGN KEY (meal_type_id) REFERENCES meal_types(id),
  CONSTRAINT fk_menu_items_cat  FOREIGN KEY (category_id)  REFERENCES categories(id),
  CONSTRAINT fk_menu_items_dish FOREIGN KEY (dish_id)      REFERENCES dishes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ETAPE 2 : INDEX UTILES
-- =====================================================
CREATE INDEX idx_menu_items_lookup ON menu_items (menu_day_id, meal_type_id, category_id);
CREATE INDEX idx_menus_year_week   ON menus (year, week_number);
CREATE INDEX idx_menu_days_date    ON menu_days (day_date);
CREATE INDEX idx_dishes_active     ON dishes (is_active);

-- =====================================================
-- ETAPE 3 : DONNEES DE BASE
-- =====================================================

-- Types de repas
INSERT INTO meal_types (code, label) VALUES
  ('MIDI', 'Midi'),
  ('SOIR', 'Soir');

-- Categories
INSERT INTO categories (code, label) VALUES
  ('SALADE',   'Salade'),
  ('VIANDE',   'Viande'),
  ('FECULENT', 'Feculent'),
  ('LEGUMES',  'Legumes'),
  ('DESSERT',  'Dessert');

-- Allergenes
INSERT INTO allergens (code, label) VALUES
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
INSERT INTO dishes (name, description) VALUES
  ('Salade verte', 'Salade verte fraiche de saison'),
  ('Salade Cesar', 'Salade romaine, croutons, parmesan, sauce Cesar'),
  ('Carottes rapees', 'Carottes rapees vinaigrette'),
  ('Taboule', 'Taboule libanais a la menthe'),
  ('Betteraves', 'Betteraves rouges vinaigrette');

-- Viandes
INSERT INTO dishes (name, description) VALUES
  ('Poulet roti', 'Poulet fermier roti au four avec herbes'),
  ('Steak hache', 'Steak hache pur boeuf'),
  ('Poisson pane', 'Filet de poisson pane croustillant'),
  ('Saucisse de Strasbourg', 'Saucisse traditionnelle'),
  ('Escalope de dinde', 'Escalope de dinde grillee');

-- Feculents
INSERT INTO dishes (name, description) VALUES
  ('Pates', 'Pates italiennes al dente'),
  ('Riz', 'Riz blanc parfume'),
  ('Pommes de terre', 'Pommes de terre vapeur'),
  ('Frites', 'Frites maison croustillantes'),
  ('Puree', 'Puree de pommes de terre maison');

-- Legumes
INSERT INTO dishes (name, description) VALUES
  ('Haricots verts', 'Haricots verts frais vapeur'),
  ('Courgettes', 'Courgettes sautees a l ail'),
  ('Brocolis', 'Brocolis vapeur'),
  ('Carottes', 'Carottes glacees au miel'),
  ('Ratatouille', 'Ratatouille provencale');

-- Desserts
INSERT INTO dishes (name, description) VALUES
  ('Yaourt', 'Yaourt nature ou aux fruits'),
  ('Compote', 'Compote de pommes maison'),
  ('Fruit', 'Fruit frais de saison'),
  ('Mousse au chocolat', 'Mousse au chocolat onctueuse'),
  ('Tarte aux pommes', 'Tarte aux pommes traditionnelle');

-- =====================================================
-- ETAPE 5 : MENU SEMAINE 45/2025 (4-8 novembre)
-- =====================================================

-- Menu principal
INSERT INTO menus (year, week_number, week_label, start_date, end_date)
VALUES (2025, 45, '4 au 8 novembre 2025', '2025-11-04', '2025-11-08');

-- Les 5 jours
INSERT INTO menu_days (menu_id, day_name, day_date)
SELECT m.id, 'Lundi', '2025-11-04'     FROM menus m WHERE m.year=2025 AND m.week_number=45
UNION ALL
SELECT m.id, 'Mardi', '2025-11-05'     FROM menus m WHERE m.year=2025 AND m.week_number=45
UNION ALL
SELECT m.id, 'Mercredi', '2025-11-06'  FROM menus m WHERE m.year=2025 AND m.week_number=45
UNION ALL
SELECT m.id, 'Jeudi', '2025-11-07'     FROM menus m WHERE m.year=2025 AND m.week_number=45
UNION ALL
SELECT m.id, 'Vendredi', '2025-11-08'  FROM menus m WHERE m.year=2025 AND m.week_number=45;

-- =====================================================
-- ETAPE 6 : REMPLISSAGE MENU (50 items)
-- =====================================================

-- LUNDI MIDI
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet roti') OR
  (c.code='FECULENT' AND d.name='Pates') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
);

-- LUNDI SOIR
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Lundi' AND md.day_date='2025-11-04' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Carottes rapees') OR
  (c.code='VIANDE'   AND d.name='Steak hache') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
);

-- MARDI MIDI
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Salade Cesar') OR
  (c.code='VIANDE'   AND d.name='Poisson pane') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
);

-- MARDI SOIR
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Mardi' AND md.day_date='2025-11-05' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Taboule') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Puree') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
);

-- MERCREDI MIDI
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
);

-- MERCREDI SOIR
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Mercredi' AND md.day_date='2025-11-06' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade verte') OR
  (c.code='VIANDE'   AND d.name='Poulet roti') OR
  (c.code='FECULENT' AND d.name='Riz') OR
  (c.code='LEGUMES'  AND d.name='Haricots verts') OR
  (c.code='DESSERT'  AND d.name='Yaourt')
);

-- JEUDI MIDI
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Carottes rapees') OR
  (c.code='VIANDE'   AND d.name='Steak hache') OR
  (c.code='FECULENT' AND d.name='Pates') OR
  (c.code='LEGUMES'  AND d.name='Courgettes') OR
  (c.code='DESSERT'  AND d.name='Compote')
);

-- JEUDI SOIR
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Jeudi' AND md.day_date='2025-11-07' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Salade Cesar') OR
  (c.code='VIANDE'   AND d.name='Poisson pane') OR
  (c.code='FECULENT' AND d.name='Pommes de terre') OR
  (c.code='LEGUMES'  AND d.name='Brocolis') OR
  (c.code='DESSERT'  AND d.name='Fruit')
);

-- VENDREDI MIDI
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='MIDI' AND (
  (c.code='SALADE'   AND d.name='Taboule') OR
  (c.code='VIANDE'   AND d.name='Escalope de dinde') OR
  (c.code='FECULENT' AND d.name='Puree') OR
  (c.code='LEGUMES'  AND d.name='Carottes') OR
  (c.code='DESSERT'  AND d.name='Mousse au chocolat')
);

-- VENDREDI SOIR
INSERT INTO menu_items (menu_day_id, meal_type_id, category_id, dish_id)
SELECT md.id, mt.id, c.id, d.id
FROM menu_days md, meal_types mt, categories c, dishes d
WHERE md.day_name='Vendredi' AND md.day_date='2025-11-08' AND mt.code='SOIR' AND (
  (c.code='SALADE'   AND d.name='Betteraves') OR
  (c.code='VIANDE'   AND d.name='Saucisse de Strasbourg') OR
  (c.code='FECULENT' AND d.name='Frites') OR
  (c.code='LEGUMES'  AND d.name='Ratatouille') OR
  (c.code='DESSERT'  AND d.name='Tarte aux pommes')
);

-- =====================================================
-- FIN : MySQL pret avec donnees completes
-- =====================================================