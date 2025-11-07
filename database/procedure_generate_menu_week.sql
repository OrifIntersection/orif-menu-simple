/* =====================================================
   PROCÉDURE : generate_menu_week
   À EXÉCUTER SÉPARÉMENT dans phpMyAdmin
   ===================================================== */

-- ⚠️  INSTRUCTIONS :
-- 1. Exécute d'abord script_MySQL.sql (le script principal)
-- 2. Puis viens ici et exécute cette procédure SEULE
-- 3. Dans phpMyAdmin, change le "Delimiter" en bas à "$$"
-- 4. Colle ce script et clique sur "Exécuter"

DROP PROCEDURE IF EXISTS generate_menu_week$$

CREATE PROCEDURE generate_menu_week(
  IN p_year INT,
  IN p_week_number INT,
  IN p_week_label VARCHAR(255),
  IN p_start_date DATE
)
BEGIN
  DECLARE v_menu_id BIGINT;
  DECLARE v_i INT DEFAULT 0;
  DECLARE v_day_name VARCHAR(16);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  -- Vérifie que le menu n'existe pas déjà
  IF EXISTS (SELECT 1 FROM menus WHERE `year`=p_year AND `week_number`=p_week_number) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Menu already exists for this year/week';
  END IF;

  INSERT INTO menus(`year`, `week_number`, `week_label`, `start_date`, `end_date`)
  VALUES (p_year, p_week_number, p_week_label, p_start_date, DATE_ADD(p_start_date, INTERVAL 4 DAY));
  SET v_menu_id = LAST_INSERT_ID();

  WHILE v_i < 5 DO
    SET v_day_name = ELT(v_i+1, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi');
    INSERT INTO menu_days(`menu_id`, `day_name`, `day_date`)
    VALUES (v_menu_id, v_day_name, DATE_ADD(p_start_date, INTERVAL v_i DAY));
    SET v_i = v_i + 1;
  END WHILE;
  
  COMMIT;
END$$

-- =====================================================
-- TEST DE LA PROCÉDURE
-- =====================================================
-- Décommente ces lignes pour tester (crée le menu semaine 46/2025) :

-- CALL generate_menu_week(2025, 46, '11 au 15 novembre 2025', '2025-11-11')$$

-- Vérifie :
-- SELECT * FROM menus WHERE week_number = 46$$
-- SELECT * FROM menu_days WHERE menu_id = (SELECT id FROM menus WHERE week_number = 46)$$
