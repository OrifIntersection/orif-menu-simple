import { supabase } from '../lib/supabase.js'

/**
 * Service pour gérer les données de menu avec Supabase
 * NOUVELLE STRUCTURE : meals, dishes, meals_dishes avec ENUMs
 */
export class MenuService {

  /**
   * Vérifier si Supabase est disponible
   */
  static async isSupabaseAvailable() {
    if (!supabase) {
      return false;
    }
    try {
      const { error } = await supabase.from('dishes').select('count').limit(1);
      return !error;
    } catch {
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
      console.error('Erreur lors de la récupération des menus:', error);
      return [];
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
      console.error('Erreur lors de la récupération du menu de la semaine:', error);
      return null;
    }
  }

  /**
   * Récupérer le menu d'une date spécifique
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Promise<Array>} Meals de la journée avec plats
   */
  static async getMenuForDate(date) {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un menu vide');
      return [];
    }
    
    try {
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
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération du menu pour la date:', error);
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
      const { data: existingMeal, error: searchError } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_date', mealDate)
        .eq('meal_type', normalizedMealType)
        .maybeSingle();

      if (existingMeal && !searchError) {
        return existingMeal;
      }

      // Créer un nouveau meal
      const { data, error } = await supabase
        .from('meals')
        .insert({ 
          meal_date: mealDate, 
          meal_type: normalizedMealType
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
   */
  static async assignDishToMeal(mealId, dishId, position = null) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de l\'assignation du plat');
      return Promise.resolve();
    }

    try {
      const { data, error } = await supabase
        .from('meals_dishes')
        .upsert({
          meal_id: mealId,
          dish_id: dishId,
          position: position
        }, {
          onConflict: 'meal_id,dish_id'
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
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @returns {Promise<void>}
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
