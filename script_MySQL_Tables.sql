-- =====================================================================
-- 0) RESET DE LA BASE
-- =====================================================================
DROP DATABASE IF EXISTS cafet;
CREATE DATABASE cafet
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE cafet;

-- =====================================================================
-- 1) TABLES (STYLE "CLASSIQUE" COMPATIBLE WORKBENCH)
--    - Pas de CHECK constraints
--    - Pas de IF NOT EXISTS
--    - ENUM à la place des CHECK
--    - Ordre de création référent → référencé
-- =====================================================================

-- Utilisateurs (stub d'auth)
CREATE TABLE auth_users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Profils liés à un user (1:1)
CREATE TABLE profiles (
  user_id CHAR(36) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin','cook','viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES auth_users(id)
    ON DELETE CASCADE
);

-- Types de repas (ex: PetitDéj / Midi / Soir)
CREATE TABLE meal_types (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL UNIQUE,
  label VARCHAR(32) NOT NULL,
  PRIMARY KEY (id)
);

-- Catégories (ex: Plat, Accompagnement, Dessert)
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(64) NOT NULL,
  PRIMARY KEY (id)
);

-- Menus hebdomadaires
-- NB: `year` est un identifiant entre backticks pour éviter tout conflit
CREATE TABLE menus (
  id BIGINT NOT NULL AUTO_INCREMENT,
  `year` INT NOT NULL,
  week_number INT NOT NULL,
  week_label VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_menus_year_week (`year`, week_number)
);

-- Jours d'un menu
CREATE TABLE menu_days (
  id BIGINT NOT NULL AUTO_INCREMENT,
  menu_id BIGINT NOT NULL,
  -- ENUM en français pour rester lisible et remplacer le CHECK
  day_name ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
  day_date DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_menu_day (menu_id, day_name),
  CONSTRAINT fk_menu_days_menu
    FOREIGN KEY (menu_id) REFERENCES menus(id)
    ON DELETE CASCADE
);

-- Catalogue des plats
CREATE TABLE dishes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_path VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Affectation des plats à un jour/type/catégorie
CREATE TABLE menu_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  menu_day_id BIGINT NOT NULL,
  meal_type_id INT NOT NULL,
  category_id INT NOT NULL,
  dish_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_menu_items (menu_day_id, meal_type_id, category_id),
  CONSTRAINT fk_menu_items_day
    FOREIGN KEY (menu_day_id) REFERENCES menu_days(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_menu_items_meal
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id),
  CONSTRAINT fk_menu_items_cat
    FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_menu_items_dish
    FOREIGN KEY (dish_id) REFERENCES dishes(id)
);

-- Allergènes
CREATE TABLE allergens (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(128) NOT NULL,
  PRIMARY KEY (id)
);

-- Allergènes par plat (N:N)
CREATE TABLE dish_allergens (
  dish_id BIGINT NOT NULL,
  allergen_id INT NOT NULL,
  PRIMARY KEY (dish_id, allergen_id),
  CONSTRAINT fk_da_dish
    FOREIGN KEY (dish_id) REFERENCES dishes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_da_allergen
    FOREIGN KEY (allergen_id) REFERENCES allergens(id)
);

-- =====================================================================
-- 2) INDEXS UTILES (mêmes intentions que ton script d'origine)
-- =====================================================================
CREATE INDEX idx_menu_items_lookup ON menu_items (menu_day_id, meal_type_id, category_id);
CREATE INDEX idx_menus_year_week   ON menus (`year`, week_number);
CREATE INDEX idx_menu_days_date    ON menu_days (day_date);
CREATE INDEX idx_dishes_active     ON dishes (is_active);
