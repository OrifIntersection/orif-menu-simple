# Guide de Migration - Structure Simplifiée avec ENUMs

## ✅ Modifications Complétées

### **1. Script SQL de Migration** (`migration_enum_structure.sql`)

#### Nouvelle structure :
- **ENUMs** : `meal_type` (MIDI/SOIR) et `dish_type` (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
- **Tables** :
  - `dishes` : Plats avec colonne `dish_type` (enum)
  - `meals` : Repas identifiés par `meal_date` + `meal_type` (enum)
  - `meals_dishes` : Table de liaison (many-to-many)
  - `profiles` : Profils utilisateurs avec rôles

#### Tables supprimées :
- ❌ `meal_items`
- ❌ `meal_types`
- ❌ `categories`
- ❌ `menus`
- ❌ `menu_days`
- ❌ `menu_items`

---

### **2. Front-End Adapté**

#### **MenuService.js** ✅
- `getAllMenus()` → Interroge `meals` au lieu de `menus`
- `getMenuByWeek()` → Jointures sur `meals → meals_dishes → dishes`
- `getMenuForDate()` → Interroge `meals` avec `meal_date`
- `getOrCreateDish()` → Utilise `dish_type` (enum)
- `getOrCreateMeal()` → Utilise `meal_type` (enum)
- `assignDishToMeal()` → Insère dans `meals_dishes`
- `clearMenuForDate()` → Supprime depuis `meals` et `meals_dishes`

#### **useMenus.js** ✅
- `loadAllMenus()` → Interroge `meals.meal_date`
- `loadMenuByWeek()` → Jointures sur `meals → meals_dishes → dishes`
- `loadReferenceData()` → Retourne les ENUMs en dur (plus de requêtes DB)

#### **menuNormalizer.js** ✅
- Gère **3 formats** :
  1. **localStorage** (format legacy)
  2. **Nouvelle structure Supabase** (array de meals avec jointures)
  3. **Ancienne structure** (meal_items) pour compatibilité temporaire

#### **Pages Adaptées** ✅
- `DailyMenu.jsx` → Interroge `meals` au lieu de `meal_items`
- `WeekMenuPage.jsx` → Interroge `meals` avec jointures
- `App.jsx` → Interroge `meals`
- `MenuDrawer.jsx` → Interroge `meals.meal_date`
- `WeekEditor.jsx` → Interroge `meals` avec jointures

---

## ⚠️ **Problème Identifié par l'Architecte**

### **WeekEditor.jsx utilise encore `category_id` et `mealTypeId`**

**Lignes problématiques** :
- Ligne 119-122 : `getAssignedDish(mealTypeId, categoryId)`
- Ligne 131 : Clé `${mealTypeId}_${categoryId}`
- Ligne 149 : `assignDishToMenu(currentDate, mealTypeId, categoryId, dishId)`
- Ligne 200 : `const [mealTypeId, categoryId] = key.split('_').map(Number);`

**Solution** : Adapter WeekEditor pour qu'il utilise directement les ENUMs (`meal_type` et `dish_type`) au lieu des IDs.

---

## 📋 **Prochaines Étapes**

### **Avant d'appliquer le script SQL** :

1. **Adapter WeekEditor.jsx** pour :
   - Utiliser `meal_type` ('MIDI'/'SOIR') au lieu de `mealTypeId`
   - Utiliser `dish_type` ('ENTREE', 'PLAT', etc.) au lieu de `categoryId`
   - Modifier la structure de clé : `${meal_type}_${dish_type}` au lieu de `${mealTypeId}_${categoryId}`

2. **Créer les méthodes de sauvegarde manquantes** dans MenuService.js :
   - `assignDishToMenu()` adapté pour la nouvelle structure
   - `removeDishFromMenu()` adapté pour la nouvelle structure

3. **Tester en local** :
   - Créer quelques données de test dans Supabase
   - Vérifier que les emojis s'affichent correctement
   - Tester l'édition des menus

### **Application du script SQL** :

```bash
# Connexion à Supabase
psql "postgresql://user:password@host:port/database"

# Exécuter le script
\i migration_enum_structure.sql
```

### **Vérifications post-migration** :

1. ✅ Toutes les tables sont créées
2. ✅ Les ENUMs sont définis
3. ✅ Les RLS policies fonctionnent
4. ✅ Les profils admin sont créés
5. ✅ Les données exemples sont insérées

---

## 🎯 **Avantages de la Nouvelle Structure**

### **Simplicité** ✨
- **3 tables** au lieu de 7
- Pas de tables de référence (meal_types, categories)
- ENUMs auto-documentés

### **Performance** 🚀
- Moins de JOIN nécessaires
- Index optimisés
- Requêtes plus rapides

### **Maintenabilité** 🔧
- Types strictement définis
- Moins de données redondantes
- Code plus clair

### **Évolutivité** 📈
- Facile d'ajouter de nouveaux types via ALTER TYPE
- Structure extensible (allergens, nutritional_info, etc.)

---

## 🔍 **Comparaison des Requêtes**

### **Avant** (meal_items) :
```sql
SELECT
  meal_items.*,
  meal_types.code,
  categories.code,
  dishes.name
FROM meal_items
JOIN meal_types ON meal_items.meal_type_id = meal_types.id
JOIN categories ON meal_items.category_id = categories.id
JOIN dishes ON meal_items.dish_id = dishes.id
WHERE meal_items.date = '2025-11-21';
```

### **Après** (meals) :
```sql
SELECT
  meals.*,
  meals_dishes.*,
  dishes.*
FROM meals
JOIN meals_dishes ON meals.id = meals_dishes.meal_id
JOIN dishes ON meals_dishes.dish_id = dishes.id
WHERE meals.meal_date = '2025-11-21';
```

✅ **Plus simple, plus lisible, plus performant !**

---

## 📞 **Support**

Si vous rencontrez des problèmes après la migration :
1. Vérifier les logs Supabase
2. Vérifier la console navigateur
3. Tester avec des données simples
4. Contacter l'équipe de développement

---

**Date de création** : 21 novembre 2025  
**Version** : 1.0  
**Statut** : ⚠️ En attente de finalisation WeekEditor.jsx
