# Scripts de Base de Données

Ce dossier contient tous les scripts SQL et fichiers liés à la base de données.

## Fichiers présents

### 🏗️ Scripts de création
- `script_MySQL.sql` - Script principal MySQL
- `script_MySQL_Tables.sql` - Création des tables
- `add_meal_items_table.sql` - Ajout de la table meal_items

### ⚡ Procédures stockées
- `procedure_generate_menu_week.sql` - Génération automatique des menus hebdomadaires

### ☁️ Configuration Supabase
- `supabase_setup.sql` - Configuration initiale Supabase

### 📊 Modèles de données
- `script_MySQL_Table_EER_Diagram.mwb` - Diagramme EER MySQL Workbench

## Usage

1. Exécuter d'abord `script_MySQL.sql` pour créer la structure de base
2. Utiliser `supabase_setup.sql` pour la configuration Supabase
3. Optionnel : `procedure_generate_menu_week.sql` pour l'automatisation