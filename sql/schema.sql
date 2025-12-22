-- =========================================
-- SCRIPT MYSQL - MENU CAFÉTÉRIA ORIF
-- =========================================
-- Compatible MySQL 8.0+ / MariaDB 10.5+
-- Pour déploiement sur Debian 13 (Datalik)
-- =========================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS menu_cafet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menu_cafet;

-- =========================================
-- ÉTAPE 1 : NETTOYAGE
-- =========================================

DROP TABLE IF EXISTS meals_dishes;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS users;

-- =========================================
-- ÉTAPE 2 : TABLE USERS (UTILISATEURS)
-- =========================================

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'cook', 'viewer') NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =========================================
-- ÉTAPE 3 : TABLE DISHES (PLATS)
-- =========================================

CREATE TABLE dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  dish_type ENUM('ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE') NOT NULL DEFAULT 'AUTRE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_dishes_type ON dishes(dish_type);
CREATE INDEX idx_dishes_name ON dishes(name);

-- =========================================
-- ÉTAPE 4 : TABLE MEALS (REPAS)
-- =========================================

CREATE TABLE meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_date DATE NOT NULL,
  meal_type ENUM('MIDI', 'SOIR') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_meal (meal_date, meal_type)
);

CREATE INDEX idx_meals_date ON meals(meal_date);

-- =========================================
-- ÉTAPE 5 : TABLE MEALS_DISHES (LIAISON)
-- =========================================

CREATE TABLE meals_dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_id INT NOT NULL,
  dish_id INT NOT NULL,
  dish_type ENUM('ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE') NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_meal_dish (meal_id, dish_id),
  UNIQUE KEY unique_meal_type (meal_id, dish_type),
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE INDEX idx_meals_dishes_meal ON meals_dishes(meal_id);
CREATE INDEX idx_meals_dishes_dish ON meals_dishes(dish_id);

-- =========================================
-- ÉTAPE 6 : UTILISATEUR ADMIN PAR DÉFAUT
-- =========================================

-- Mot de passe par défaut: "admin123" (à changer après installation!)
-- Hash bcrypt généré avec 10 salt rounds
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin', 'admin@orif.ch', '$2b$10$SbhdK/xbwPILz91Eb7B4leRxA8rqSzQ6VlIjXtVPTfyVm.5NUSbiK', 'Administrateur', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

-- =========================================
-- FIN DU SCRIPT
-- =========================================

SELECT 'Base de données créée avec succès!' AS message;
