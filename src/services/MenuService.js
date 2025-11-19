import { supabase } from '../lib/supabase.js'

/**
 * Service pour gérer les données de menu avec Supabase
 * Bascule vers des données statiques si Supabase n'est pas disponible
 */
export class MenuService {

  // Données statiques de fallback
  static fallbackData = {
    mealTypes: [
      { id: 1, name: 'Entrée', display_order: 1 },
      { id: 2, name: 'Plat principal', display_order: 2 },
      { id: 3, name: 'Dessert', display_order: 3 }
    ],
    categories: [
      { id: 1, name: 'Viandes', color: '#e74c3c' },
      { id: 2, name: 'Légumes', color: '#27ae60' },
      { id: 3, name: 'Desserts', color: '#f39c12' },
      { id: 4, name: 'Poissons', color: '#3498db' }
    ],
    dishes: [
      { id: 1, name: 'Salade verte', category_id: 2 },
      { id: 2, name: 'Poulet rôti', category_id: 1 },
      { id: 3, name: 'Tarte aux pommes', category_id: 3 },
      { id: 4, name: 'Saumon grillé', category_id: 4 }
    ]
  };

  /**
   * Vérifier si Supabase est disponible
   */
  static async isSupabaseAvailable() {
    if (!supabase) {
      return false;
    }
    try {
      const { error } = await supabase.from('menus').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
  
  /**
   * Récupérer tous les menus
   * @returns {Promise<Array>} Liste des menus
   */
  static async getAllMenus() {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('year', { ascending: false })
        .order('week_number', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des menus:', error)
      throw error
    }
  }

  /**
   * Récupérer un menu par année et semaine
   * @param {number} year - Année
   * @param {number} week - Numéro de semaine
   * @returns {Promise<Object|null>} Menu trouvé ou null
   */
  static async getMenuByWeek(year, week) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('year', year)
        .eq('week_number', week)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          return null
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du menu:', error)
      throw error
    }
  }

  /**
   * Créer un nouveau menu
   * @param {Object} menuData - Données du menu
   * @returns {Promise<Object>} Menu créé
   */
  static async createMenu(menuData) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .insert([menuData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du menu:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un menu
   * @param {number} menuId - ID du menu
   * @param {Object} updates - Modifications
   * @returns {Promise<Object>} Menu mis à jour
   */
  static async updateMenu(menuId, updates) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update(updates)
        .eq('id', menuId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu:', error)
      throw error
    }
  }

  /**
   * Supprimer un menu
   * @param {number} menuId - ID du menu
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteMenu(menuId) {
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du menu:', error)
      throw error
    }
  }

  /**
   * Récupérer les types de repas
   * @returns {Promise<Array>} Liste des types de repas
   */
  static async getMealTypes() {
    if (!supabase) {
      console.warn('Supabase non configuré, utilisation des données statiques pour les types de repas')
      return this.fallbackData.mealTypes
    }
    
    try {
      const { data, error } = await supabase
        .from('meal_types')
        .select('*')
        .order('id')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Supabase non disponible, utilisation des données statiques pour les types de repas:', error.message)
      return this.fallbackData.mealTypes
    }
  }

  /**
   * Récupérer les catégories
   * @returns {Promise<Array>} Liste des catégories
   */
  static async getCategories() {
    if (!supabase) {
      console.warn('Supabase non configuré, utilisation des données statiques pour les catégories')
      return this.fallbackData.categories
    }
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Supabase non disponible, utilisation des données statiques pour les catégories:', error.message)
      return this.fallbackData.categories
    }
  }

  /**
   * Récupérer les jours d'un menu
   * @param {number} menuId - ID du menu
   * @returns {Promise<Array>} Liste des jours
   */
  static async getMenuDays(menuId) {
    try {
      const { data, error } = await supabase
        .from('menu_days')
        .select('*')
        .eq('menu_id', menuId)
        .order('day_date')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des jours du menu:', error)
      throw error
    }
  }

  /**
   * Récupérer les items d'un jour de menu
   * @param {number} menuDayId - ID du jour de menu
   * @returns {Promise<Array>} Liste des items
   */
  static async getMenuItems(menuDayId) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          meal_types (code, label),
          categories (code, label),
          dishes (name, description)
        `)
        .eq('menu_day_id', menuDayId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des items du menu:', error)
      throw error
    }
  }

  /**
   * Récupérer un menu complet avec tous ses détails
   * @param {number} year - Année
   * @param {number} week - Numéro de semaine
   * @returns {Promise<Object|null>} Menu complet ou null
   */
  static async getCompleteMenuByWeek(year, week) {
    try {
      // 1. Récupérer le menu principal
      const menu = await this.getMenuByWeek(year, week)
      if (!menu) return null

      // 2. Récupérer les jours
      const menuDays = await this.getMenuDays(menu.id)

      // 3. Récupérer les items pour chaque jour
      const menuWithDetails = {
        ...menu,
        menu_days: []
      }

      for (const day of menuDays) {
        const items = await this.getMenuItems(day.id)
        menuWithDetails.menu_days.push({
          ...day,
          meal_items: items
        })
      }

      return menuWithDetails
    } catch (error) {
      console.error('Erreur lors de la récupération du menu complet:', error)
      throw error
    }
  }

  // ========================================
  // MÉTHODES CRUD POUR L'ADMINISTRATION
  // ========================================

  /**
   * Créer ou récupérer un plat (NOUVELLE STRUCTURE)
   * @param {string} name - Nom du plat
   * @param {string} dishType - Type de plat (ENTREE, PLAT, GARNITURE, LEGUME, DESSERT, AUTRE)
   * @returns {Promise<Object>} Plat créé ou existant
   */
  static async getOrCreateDish(name, dishType = 'AUTRE') {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un plat simulé')
      return { id: Date.now(), name, dish_type: dishType }
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
        .maybeSingle()

      if (existingDish && !searchError) {
        return existingDish
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
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création/récupération du plat:', error)
      throw error
    }
  }

  /**
   * Créer ou récupérer un meal (NOUVELLE STRUCTURE)
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @param {string} mealType - Type de meal (MIDI ou SOIR)
   * @returns {Promise<Object>} Meal créé ou existant
   */
  static async getOrCreateMeal(mealDate, mealType) {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un meal simulé')
      return { id: Date.now(), meal_date: mealDate, meal_type: mealType }
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
        .maybeSingle()

      if (existingMeal && !searchError) {
        return existingMeal
      }

      // Créer un nouveau meal
      const { data, error } = await supabase
        .from('meals')
        .insert({ 
          meal_date: mealDate, 
          meal_type: normalizedMealType
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création/récupération du meal:', error)
      throw error
    }
  }

  /**
   * Assigner un plat à un meal (NOUVELLE STRUCTURE)
   * @param {number} mealId - ID du meal
   * @param {number} dishId - ID du plat
   * @param {number} position - Position du plat dans le meal
   * @returns {Promise<Object>} Lien créé
   */
  static async assignDishToMeal(mealId, dishId, position = null) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de l\'assignation du plat')
      return Promise.resolve()
    }

    try {
      const { data, error} = await supabase
        .from('meals_dishes')
        .upsert({
          meal_id: mealId,
          dish_id: dishId,
          position: position
        }, {
          onConflict: 'meal_id,dish_id'
        })
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de l\'assignation du plat au meal:', error)
      throw error
    }
  }

  /**
   * Supprimer tous les plats d'un meal pour une date spécifique (NOUVELLE STRUCTURE)
   * @param {string} mealDate - Date au format YYYY-MM-DD
   * @returns {Promise<void>}
   */
  static async clearMenuForDate(mealDate) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation du vidage du menu')
      return Promise.resolve()
    }
    
    try {
      // Récupérer tous les meals pour cette date
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('id')
        .eq('meal_date', mealDate)

      if (mealsError) throw mealsError

      if (meals && meals.length > 0) {
        // Supprimer toutes les associations meals_dishes pour ces meals
        const mealIds = meals.map(m => m.id)
        const { error: deleteError } = await supabase
          .from('meals_dishes')
          .delete()
          .in('meal_id', mealIds)

        if (deleteError) throw deleteError

        // Optionnel : supprimer les meals eux-mêmes
        const { error: deleteMealsError } = await supabase
          .from('meals')
          .delete()
          .eq('meal_date', mealDate)

        if (deleteMealsError) throw deleteMealsError
      }
    } catch (error) {
      console.error('Erreur lors du vidage du menu pour la date:', error)
      throw error
    }
  }

  /**
   * Créer ou mettre à jour un menu pour une semaine
   * @param {number} year - Année
   * @param {number} week - Numéro de semaine
   * @returns {Promise<Object>} Menu créé ou existant
   */
  static async getOrCreateMenu(year, week) {
    try {
      // Chercher si le menu existe déjà
      let menu = await this.getMenuByWeek(year, week)
      
      if (menu) {
        return menu
      }

      // Créer un nouveau menu
      const { data, error } = await supabase
        .from('menus')
        .insert({ 
          year, 
          week_number: week,
          title: `Menu semaine ${week} - ${year}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du menu:', error)
      throw error
    }
  }

  /**
   * Créer ou récupérer un jour de menu
   * @param {number} menuId - ID du menu
   * @param {string} date - Date au format YYYY-MM-DD
   * @param {string} dayName - Nom du jour
   * @returns {Promise<Object>} Jour créé ou existant
   */
  static async getOrCreateMenuDay(menuId, date, dayName) {
    try {
      // Chercher si le jour existe déjà
      const { data: existingDay, error: searchError } = await supabase
        .from('menu_days')
        .select('*')
        .eq('menu_id', menuId)
        .eq('date', date)
        .single()

      if (existingDay && !searchError) {
        return existingDay
      }

      // Créer un nouveau jour
      const { data, error } = await supabase
        .from('menu_days')
        .insert({ 
          menu_id: menuId,
          date,
          day_name: dayName
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du jour de menu:', error)
      throw error
    }
  }

  /**
   * Sauvegarder un plat pour un repas spécifique
   * @param {number} menuDayId - ID du jour de menu
   * @param {number} mealTypeId - ID du type de repas (1=midi, 2=soir)
   * @param {number} categoryId - ID de la catégorie
   * @param {number} dishId - ID du plat
   * @returns {Promise<Object>} Item de menu créé
   */
  static async saveMenuItem(menuDayId, mealTypeId, categoryId, dishId) {
    try {
      // Supprimer l'ancien item s'il existe
      await supabase
        .from('meal_items')
        .delete()
        .eq('menu_day_id', menuDayId)
        .eq('meal_type_id', mealTypeId)
        .eq('category_id', categoryId)

      // Créer le nouvel item
      const { data, error } = await supabase
        .from('meal_items')
        .insert({
          menu_day_id: menuDayId,
          meal_type_id: mealTypeId,
          category_id: categoryId,
          dish_id: dishId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'item de menu:', error)
      throw error
    }
  }

  /**
   * Supprimer un plat d'un repas
   * @param {number} menuDayId - ID du jour de menu
   * @param {number} mealTypeId - ID du type de repas
   * @param {number} categoryId - ID de la catégorie
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async removeMenuItem(menuDayId, mealTypeId, categoryId) {
    try {
      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('menu_day_id', menuDayId)
        .eq('meal_type_id', mealTypeId)
        .eq('category_id', categoryId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'item de menu:', error)
      throw error
    }
  }

  // ========================================
  // MÉTHODES CRUD ÉTENDUES POUR ADMIN
  // ========================================

  /**
   * Créer ou récupérer un type de repas
   * @param {string} name - Nom du type de repas
   * @param {string} code - Code du type de repas
   * @returns {Promise<Object>} Type de repas créé ou existant
   */
  static async getOrCreateMealType(name, code) {
    try {
      // Chercher si le type existe déjà
      const { data: existingType, error: searchError } = await supabase
        .from('meal_types')
        .select('*')
        .eq('code', code)
        .single()

      if (existingType && !searchError) {
        return existingType
      }

      // Créer un nouveau type
      const { data, error } = await supabase
        .from('meal_types')
        .insert({ name, code })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création/récupération du type de repas:', error)
      throw error
    }
  }

  /**
   * Créer ou récupérer une catégorie
   * @param {string} name - Nom de la catégorie
   * @param {string} code - Code de la catégorie
   * @returns {Promise<Object>} Catégorie créée ou existante
   */
  static async getOrCreateCategory(name, code) {
    try {
      // Chercher si la catégorie existe déjà
      const { data: existingCategory, error: searchError } = await supabase
        .from('categories')
        .select('*')
        .eq('code', code)
        .single()

      if (existingCategory && !searchError) {
        return existingCategory
      }

      // Créer une nouvelle catégorie
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, code })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création/récupération de la catégorie:', error)
      throw error
    }
  }

  /**
   * Supprimer un plat
   * @param {number} dishId - ID du plat
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deleteDish(dishId) {
    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du plat:', error)
      throw error
    }
  }

  /**
   * Récupérer tous les plats
   * @returns {Promise<Array>} Liste des plats
   */
  static async getAllDishes() {
    if (!supabase) {
      console.warn('Supabase non configuré, utilisation des données statiques pour les plats')
      return this.fallbackData.dishes
    }
    
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Supabase non disponible, utilisation des données statiques pour les plats:', error.message)
      return this.fallbackData.dishes
    }
  }

  /**
   * Récupérer le menu d'une date spécifique
   * @param {Date} date - La date pour laquelle récupérer le menu
   * @returns {Promise<Object>} Menu organisé par mealType_category
   */
  static async getMenuForDate(date) {
    if (!supabase) {
      console.warn('Supabase non configuré, retour d\'un menu vide')
      return {} // Menu vide en fallback
    }
    
    try {
      const dateStr = date.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('meal_items')
        .select(`
          *,
          dishes(id, name),
          meal_types(id, label),
          categories(id, label)
        `)
        .eq('date', dateStr)

      if (error) throw error

      // Organiser les données par clé mealType_category
      const menuData = {}
      if (data) {
        data.forEach(item => {
          const key = `${item.meal_type_id}_${item.category_id}`
          menuData[key] = {
            dish_id: item.dish_id,
            dish_name: item.dishes?.name,
            meal_type: item.meal_types?.name,
            category: item.categories?.name
          }
        })
      }

      return menuData
    } catch (error) {
      console.warn('Supabase non disponible, retour d\'un menu vide pour la date:', error.message)
      return {} // Menu vide en fallback
    }
  }

  /**
   * Assigner un plat à un menu pour une date spécifique
   * @param {Date} date - La date
   * @param {number} mealTypeId - ID du type de repas
   * @param {number} categoryId - ID de la catégorie
   * @param {number} dishId - ID du plat
   */
  static async assignDishToMenu(date, mealTypeId, categoryId, dishId) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de l\'assignation du plat')
      return Promise.resolve() // Simuler un succès
    }
    try {
      const dateStr = date.toISOString().split('T')[0]
      const { error } = await supabase
        .from('meal_items')
        .upsert({
          date: dateStr,
          meal_type_id: mealTypeId,
          dish_id: dishId
        }, {
          onConflict: 'date,meal_type_id,dish_id'
        })
      if (error) throw error
    } catch (error) {
      console.warn('Supabase non disponible, simulation de l\'assignation du plat:', error.message)
      return Promise.resolve() // Mode fallback
    }
  }

  /**
   * Supprimer un plat d'un menu pour une date spécifique
   * @param {Date} date - La date
   * @param {number} mealTypeId - ID du type de repas
   * @param {number} categoryId - ID de la catégorie
   */
  static async removeDishFromMenu(date, mealTypeId, categoryId) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation de la suppression du plat')
      return Promise.resolve() // Simuler un succès
    }
    
    try {
      const dateStr = date.toISOString().split('T')[0]

      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('date', dateStr)
        .eq('meal_type_id', mealTypeId)
        .eq('category_id', categoryId)

      if (error) throw error
    } catch (error) {
      console.warn('Supabase non disponible, simulation de la suppression du plat:', error.message)
      return Promise.resolve() // Mode fallback
    }
  }

  /**
   * Supprimer tous les plats d'un menu pour une date spécifique
   * @param {Date} date - La date
   */
  static async clearMenuForDate(date) {
    if (!supabase) {
      console.warn('Supabase non configuré, simulation du vidage du menu')
      return Promise.resolve() // Simuler un succès
    }
    
    try {
      const dateStr = date.toISOString().split('T')[0]

      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('date', dateStr)

      if (error) throw error
    } catch (error) {
      console.warn('Supabase non disponible, simulation du vidage du menu:', error.message)
      return Promise.resolve() // Mode fallback
    }
  }

  /**
   * Créer un nouveau plat
   * @param {string} name - Nom du plat
   * @param {number} categoryId - ID de la catégorie
   * @returns {Promise<Object>} Plat créé
   */
  static async createDish(name, categoryId) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert({
          name: name,
          category_id: categoryId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la création du plat:', error)
      throw error
    }
  }
}