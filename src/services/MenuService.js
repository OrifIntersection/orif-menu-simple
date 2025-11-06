import { supabase } from './supabase.js'

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
        .select(`
          *,
          menu_days (
            *,
            meal_items (
              *,
              meal_types (*),
              categories (*)
            )
          )
        `)
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
        .select(`
          *,
          menu_days (
            *,
            meal_items (
              *,
              meal_types (*),
              categories (*)
            )
          )
        `)
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
}