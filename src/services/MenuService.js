import { supabase } from '../lib/supabase.js'
import { LocalMenuService } from './LocalMenuService'

/**
 * Service pour gérer les données de menu avec Supabase
 * AVEC FALLBACK localStorage en cas d'indisponibilité
 */
export class MenuService {

  /**
   * Vérifier si Supabase est disponible et configuré
   */
  static async isSupabaseAvailable() {
    if (!supabase) {
      console.warn('⚠️ Supabase non configuré - utilisation du mode fallback localStorage')
      return false;
    }
    try {
      const { error } = await supabase.from('dishes').select('count').limit(1);
      if (error) {
        console.warn('⚠️ Supabase indisponible:', error.message, '- utilisation du mode fallback localStorage')
        return false
      }
      return true;
    } catch (err) {
      console.warn('⚠️ Erreur Supabase:', err.message, '- utilisation du mode fallback localStorage')
      return false;
    }
  }
  
  // ========================================
  // MÉTHODES DE LECTURE DES MENUS
  // ========================================

  /**
   * Récupérer tous les meals disponibles (regroupés par semaine)
   * @returns {Promise<Array>} Liste des semaines avec menus
   */
  static async getAllMenus() {
    try {
      // Vérifier si Supabase est disponible
      const isAvailable = await this.isSupabaseAvailable();
      
      if (!isAvailable) {
        // Fallback: utiliser localStorage
        console.log('📚 Chargement des menus depuis localStorage');
        return LocalMenuService.getAllMenus();
      }

      const { data, error } = await supabase
        .from('meals')
        .select('meal_date')
        .order('meal_date', { ascending: false });

      if (error) throw error;

      // Regrouper par semaine/année
      const weeks = {};
      data.forEach(item => {
        const d = new Date(item.meal_date);
        const year = d.getFullYear();
        const jan1 = new Date(year, 0, 1);
        const days = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
        const key = `${year}-W${weekNum}`;
        if (!weeks[key]) weeks[key] = { year, weekNum, dates: [] };
        weeks[key].dates.push(item.meal_date);
      });

      return Object.values(weeks);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des menus, fallback localStorage:', error);
      return LocalMenuService.getAllMenus();
    }
  }

  /**
   * Récupérer le menu d'une semaine spécifique
   * @param {number} year - Année
   * @param {number} week - Numéro de semaine
   * @returns {Promise<Array>} Meals de la semaine avec plats
   */
  static async getMenuByWeek(year, week) {
    try {
      // Vérifier si Supabase est disponible
      const isAvailable = await this.isSupabaseAvailable();
      
      if (!isAvailable) {
        console.log('📅 Chargement du menu de la semaine depuis localStorage');
        const menu = LocalMenuService.getMenuByWeek(year, week);
        return menu ? [menu] : [];
      }

      // Calculer les dates de la semaine
      const monday = (y, w) => {
        const d = new Date(y, 0, 1 + (w - 1) * 7);
        const day = d.getDay();
        const mondayOffset = day <= 4 ? day - 1 : day - 8;
        d.setDate(d.getDate() - mondayOffset);
        return d;
      };

      const start = monday(year, week);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toISOString().slice(0, 10);
      });

      // Récupérer les meals avec leurs plats
      const { data, error } = await supabase
        .from('meals')
        .select(`
          id,
          meal_date,
          meal_type,
          meals_dishes (
            dish_id,
            position,
            dishes (
              id,
              name,
              description,
              dish_type
            )
          )
        `)
        .in('meal_date', weekDates)
        .order('meal_date');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du menu de la semaine, fallback localStorage:', error);
      const menu = LocalMenuService.getMenuByWeek(year, week);
      return menu ? [menu] : [];
    }
  }

  /**
   * Récupérer le menu d'une date spécifique
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Promise<Array>} Meals de la journée avec plats
   */
  static async getMenuForDate(date) {
    try {
      // Vérifier si Supabase est disponible
      const isAvailable = await this.isSupabaseAvailable();
      
      if (!isAvailable) {
        console.log('📆 Chargement du menu pour la date depuis localStorage');
        return [];
      }
      
      console.log('📆 Chargement menu pour date:', date);
      
      const { data, error } = await supabase
        .from('meals')
        .select(`
          id,
          meal_date,
          meal_type,
          meals_dishes (
            dish_id,
            position,
            dishes (
              id,
              name,
              description,
              dish_type
            )
          )
        `)
        .eq('meal_date', date)
        .order('meal_type');

      if (error) throw error;
      console.log('✅ Menu trouvé:', data?.length || 0, 'repas');
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du menu pour la date, fallback localStorage:', error);
      return [];
    }
  }

  // ========================================
  // MÉTHODES CRUD POUR LES PLATS
  // ========================================

  /**
   * Créer ou récupérer un plat
   * @param {string} name - Nom du plat
   * @param {string} dishType - Type de plat (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
   * @returns {Promise<Object>} Plat créé ou existant
   */
  static async getOrCreateDish(name, dishType = 'AUTRE') {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un plat simulé');
      return { id: Date.now(), name, dish_type: dishType };
    }

    try {
      // Normaliser le type de plat
      const validTypes = ['ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE'];
      const normalizedType = validTypes.includes(dishType) ? dishType : 'AUTRE';

      // Chercher si le plat existe déjà avec ce nom ET ce type
      const { data: existingDish, error: searchError } = await supabase
        .from('dishes')
        .select('*')
        .eq('name', name)
        .eq('dish_type', normalizedType)
        .maybeSingle();

      if (existingDish && !searchError) {
        return existingDish;
      }

      // Créer un nouveau plat
      const { data, error } = await supabase
        .from('dishes')
        .insert({ 
          name, 
          dish_type: normalizedType,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création/récupération du plat:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les plats actifs
   * @returns {Promise<Array>} Liste des plats
   */
  static async getAllDishes() {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'une liste vide');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('is_active', true)
        .order('dish_type')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des plats:', error);
      return [];
    }
  }

  /**
   * Supprimer un plat (désactivation)
   * @param {number} dishId - ID du plat
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteDish(dishId) {
    try {
      // Désactiver le plat au lieu de le supprimer
      const { error } = await supabase
        .from('dishes')
        .update({ is_active: false })
        .eq('id', dishId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du plat:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTHODES CRUD POUR LES MEALS
  // ========================================

  /**
   * Créer ou récupérer un meal
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {string} mealType - Type de meal (MIDI ou SOIR)
   * @returns {Promise<Object>} Meal créé ou existant
   */
  static async getOrCreateMeal(mealDate, mealType) {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un meal simulé');
      return { id: Date.now(), meal_date: mealDate, meal_type: mealType };
    }

    try {
      // Normaliser le type de meal
      const normalizedMealType = mealType.toUpperCase() === 'MIDI' ? 'MIDI' : 'SOIR';

      // Chercher si le meal existe déjà
      console.log('🔍 Cherche meal existant:', mealDate, normalizedMealType);
      
      const { data: existingMeal, error: searchError } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_date', mealDate)
        .eq('meal_type', normalizedMealType)
        .maybeSingle();

      if (existingMeal && !searchError) {
        return existingMeal;
      }

      // Créer un nouveau meal avec UPSERT pour éviter les conflits 409
      // quand plusieurs requêtes se font simultanément pour le même (date, type)
      const { data, error } = await supabase
        .from('meals')
        .upsert({ 
          meal_date: mealDate, 
          meal_type: normalizedMealType
        }, {
          onConflict: 'meal_date,meal_type'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création/récupération du meal:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTHODES CRUD POUR LES LIAISONS MEALS_DISHES
  // ========================================

  /**
   * Assigner un plat à un meal
   * @param {number} mealId - ID du meal
   * @param {number} dishId - ID du plat
   * @param {number} position - Position du plat dans le meal
   * @returns {Promise<Object>} Lien créé
   * @deprecated Utiliser assignDishToMealByType() qui garantit l'unicité par type
   */
  static async assignDishToMeal(mealId, dishId, position = null) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de l\'assignation du plat');
      return Promise.resolve();
    }

    try {
      // Récupérer le dish_type pour la contrainte UNIQUE
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('dish_type')
        .eq('id', dishId)
        .single();

      if (dishError) throw dishError;

      const { data, error } = await supabase
        .from('meals_dishes')
        .upsert({
          meal_id: mealId,
          dish_id: dishId,
          dish_type: dish.dish_type,  // Obligatoire pour la contrainte
          position: position
        }, {
          onConflict: 'meal_id,dish_type'  // Basé sur la contrainte UNIQUE
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'assignation du plat au meal:', error);
      throw error;
    }
  }

  /**
   * Supprimer un plat d'un meal
   * @param {number} mealId - ID du meal
   * @param {number} dishId - ID du plat
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async removeDishFromMeal(mealId, dishId) {
    if (!supabase) {
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('meals_dishes')
        .delete()
        .eq('meal_id', mealId)
        .eq('dish_id', dishId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du plat du meal:', error);
      throw error;
    }
  }

  /**
   * Supprimer tous les plats d'un meal pour une date spécifique
   * ⚠️ ATTENTION: Cette méthode supprime TOUS les meals (MIDI + SOIR) de la journée
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @returns {Promise<void>}
   * @deprecated Utiliser clearMealByType() pour éviter la perte de données
   */
  static async clearMenuForDate(mealDate) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation du vidage du menu');
      return Promise.resolve();
    }
    
    try {
      // Récupérer tous les meals pour cette date
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('id')
        .eq('meal_date', mealDate);

      if (mealsError) throw mealsError;

      if (meals && meals.length > 0) {
        // Supprimer toutes les associations meals_dishes pour ces meals
        const mealIds = meals.map(m => m.id);
        const { error: deleteError } = await supabase
          .from('meals_dishes')
          .delete()
          .in('meal_id', mealIds);

        if (deleteError) throw deleteError;

        // Optionnel : supprimer les meals eux-mêmes
        const { error: deleteMealsError } = await supabase
          .from('meals')
          .delete()
          .eq('meal_date', mealDate);

        if (deleteMealsError) throw deleteMealsError;
      }
    } catch (error) {
      console.error('Erreur lors du vidage du menu pour la date:', error);
      throw error;
    }
  }

  /**
   * Supprimer tous les plats d'un meal spécifique (par type)
   * Cette méthode supprime UNIQUEMENT le meal du type spécifié (MIDI ou SOIR)
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {string} mealType - Type de repas (MIDI ou SOIR)
   * @returns {Promise<void>}
   */
  static async clearMealByType(mealDate, mealType) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation du vidage du meal');
      return Promise.resolve();
    }
    
    try {
      // Récupérer le meal spécifique
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .select('id')
        .eq('meal_date', mealDate)
        .eq('meal_type', mealType)
        .maybeSingle();

      if (mealError) throw mealError;

      if (meal) {
        // Supprimer toutes les associations meals_dishes pour ce meal
        const { error: deleteError } = await supabase
          .from('meals_dishes')
          .delete()
          .eq('meal_id', meal.id);

        if (deleteError) throw deleteError;

        // Supprimer le meal lui-même
        const { error: deleteMealError } = await supabase
          .from('meals')
          .delete()
          .eq('id', meal.id);

        if (deleteMealError) throw deleteMealError;

        console.log(`🗑️ Menu ${mealType} supprimé pour le ${mealDate}`);
      }
    } catch (error) {
      console.error(`Erreur lors du vidage du meal ${mealType} pour la date:`, error);
      throw error;
    }
  }

  /**
   * Assigner un plat à un meal basé sur les types (ENUM)
   * Cette méthode garantit qu'un seul plat d'un type donné est assigné à un repas
   * 
   * GESTION DE L'UNICITÉ :
   * L'unicité par (meal_type, dish_type) est garantie au niveau applicatif via delete+insert atomique.
   * Une contrainte UNIQUE au niveau base de données nécessiterait :
   *   - Soit d'ajouter dish_type dans meals_dishes (dénormalisation)
   *   - Soit d'utiliser un trigger PostgreSQL (complexe)
   * La solution actuelle (gestion applicative) est suffisante pour éviter les doublons.
   * 
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {string} mealType - Type de repas (MIDI ou SOIR)
   * @param {string} dishType - Type de plat (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
   * @param {number} dishId - ID du plat à assigner
   * @returns {Promise<void>}
   */
  static async assignDishToMealByType(mealDate, mealType, dishType, dishId) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de l\'assignation');
      return Promise.resolve();
    }

    try {
      // 1. Créer ou récupérer le meal
      const meal = await this.getOrCreateMeal(mealDate, mealType);

      // 2. Vérifier le dish
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', dishId)
        .single();

      if (dishError) throw dishError;

      // 3. Vérifier que le plat a bien le bon type
      if (dish.dish_type !== dishType) {
        throw new Error(`Le plat ${dish.name} (${dish.dish_type}) ne correspond pas au type demandé (${dishType})`);
      }

      // 4. UPSERT basé sur la contrainte UNIQUE (meal_id, dish_type)
      // Remplace automatiquement le plat existant de ce type s'il y en a un
      const { error: upsertError } = await supabase
        .from('meals_dishes')
        .upsert({
          meal_id: meal.id,
          dish_id: dishId,
          dish_type: dishType,  // Nécessaire pour la contrainte UNIQUE
          position: null
        }, {
          onConflict: 'meal_id,dish_type'  // Clé de conflit = contrainte UNIQUE
        });

      if (upsertError) throw upsertError;

      console.log(`✅ Plat assigné: ${dish.name} (${dishType}) pour ${mealType} le ${mealDate}`);
    } catch (error) {
      console.error('Erreur lors de l\'assignation du plat par type:', error);
      throw error;
    }
  }

  /**
   * Supprimer un plat d'un meal basé sur les types (ENUM)
   * Cette méthode supprime UNIQUEMENT le plat de ce type, sans toucher aux autres
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {string} mealType - Type de repas (MIDI ou SOIR)
   * @param {string} dishType - Type de plat (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
   * @returns {Promise<void>}
   */
  static async removeDishFromMealByType(mealDate, mealType, dishType) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de la suppression');
      return Promise.resolve();
    }

    try {
      // 1. Récupérer le meal
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .select('id')
        .eq('meal_date', mealDate)
        .eq('meal_type', mealType)
        .maybeSingle();

      if (mealError) throw mealError;
      if (!meal) {
        console.log(`Aucun meal trouvé pour ${mealType} le ${mealDate}`);
        return;
      }

      // 2. Supprimer directement basé sur la contrainte UNIQUE (meal_id, dish_type)
      const { error: deleteError } = await supabase
        .from('meals_dishes')
        .delete()
        .eq('meal_id', meal.id)
        .eq('dish_type', dishType);

      if (deleteError) throw deleteError;
      
      console.log(`🗑️ Plat ${dishType} supprimé pour ${mealType} le ${mealDate}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du plat par type:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder un menu complet pour une date
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {Object} menuData - Données du menu structurées par type de repas et plat
   * @returns {Promise<void>}
   */
  static async saveCompleteMenuForDate(mealDate, menuData) {
    try {
      // menuData format: { MIDI: [{ name: 'Salade', type: 'ENTREE' }, ...], SOIR: [...] }
      
      for (const [mealType, dishes] of Object.entries(menuData)) {
        if (!dishes || dishes.length === 0) continue;

        // Créer ou récupérer le meal
        const meal = await this.getOrCreateMeal(mealDate, mealType);

        // Ajouter chaque plat
        for (let i = 0; i < dishes.length; i++) {
          const dishData = dishes[i];
          
          // Créer ou récupérer le plat
          const dish = await this.getOrCreateDish(dishData.name, dishData.type);
          
          // Assigner le plat au meal
          await this.assignDishToMeal(meal.id, dish.id, i);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du menu complet:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTHODES DE COMPATIBILITÉ (DEPRECATED)
  // ========================================

  /**
   * @deprecated Utiliser getAllMenus() à la place
   */
  static async getMealTypes() {
    console.warn('getMealTypes() est deprecated. Les types sont maintenant des ENUMs (MIDI/SOIR)');
    return [
      { code: 'MIDI', label: 'Midi' },
      { code: 'SOIR', label: 'Soir' }
    ];
  }

  /**
   * @deprecated Utiliser dish_type (ENUM) à la place
   */
  static async getCategories() {
    console.warn('getCategories() est deprecated. Utiliser dish_type (ENUM) à la place');
    return [
      { code: 'ENTREE', label: 'Entrée', emoji: '🥗' },
      { code: 'PLAT', label: 'Plat principal', emoji: '🍽️' },
      { code: 'GARNITURE', label: 'Garniture', emoji: '🥔' },
      { code: 'LEGUME', label: 'Légume', emoji: '🥬' },
      { code: 'DESSERT', label: 'Dessert', emoji: '🍰' },
      { code: 'AUTRE', label: 'Autre', emoji: '✨' }
    ];
  }
}