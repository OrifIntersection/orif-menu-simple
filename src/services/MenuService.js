import { supabase } from '../lib/supabase.js'

/**
 * Service pour gérer les données de menu avec Supabase
 */
export class MenuService {
  
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
    try {
      const { data, error } = await supabase
        .from('meal_types')
        .select('*')
        .order('id')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des types de repas:', error)
      throw error
    }
  }

  /**
   * Récupérer les catégories
   * @returns {Promise<Array>} Liste des catégories
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      throw error
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
}