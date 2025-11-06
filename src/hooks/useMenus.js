import { useState, useEffect } from 'react'
import { MenuService } from '../services/MenuService.js'

/**
 * Hook personnalisé pour gérer les menus avec Supabase
 * @param {number} initialYear - Année initiale
 * @param {number} initialWeek - Semaine initiale
 * @returns {Object} État et fonctions de gestion des menus
 */
export const useMenus = (initialYear = null, initialWeek = null) => {
  const [menus, setMenus] = useState([])
  const [currentMenu, setCurrentMenu] = useState(null)
  const [mealTypes, setMealTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Charger tous les menus
  const loadAllMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MenuService.getAllMenus()
      setMenus(data)
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menus:', err)
    } finally {
      setLoading(false)
    }
  }

  // Charger un menu spécifique
  const loadMenuByWeek = async (year, week) => {
    try {
      setLoading(true)
      setError(null)
      const data = await MenuService.getMenuByWeek(year, week)
      setCurrentMenu(data)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menu:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Charger les données de référence (types de repas et catégories)
  const loadReferenceData = async () => {
    try {
      const [mealTypesData, categoriesData] = await Promise.all([
        MenuService.getMealTypes(),
        MenuService.getCategories()
      ])
      setMealTypes(mealTypesData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Erreur chargement données de référence:', err)
    }
  }

  // Créer un nouveau menu
  const createMenu = async (menuData) => {
    try {
      setLoading(true)
      setError(null)
      const newMenu = await MenuService.createMenu(menuData)
      setMenus(prev => [newMenu, ...prev])
      return newMenu
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour un menu
  const updateMenu = async (menuId, updates) => {
    try {
      setLoading(true)
      setError(null)
      const updatedMenu = await MenuService.updateMenu(menuId, updates)
      setMenus(prev => prev.map(menu => 
        menu.id === menuId ? updatedMenu : menu
      ))
      if (currentMenu && currentMenu.id === menuId) {
        setCurrentMenu(updatedMenu)
      }
      return updatedMenu
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un menu
  const deleteMenu = async (menuId) => {
    try {
      setLoading(true)
      setError(null)
      await MenuService.deleteMenu(menuId)
      setMenus(prev => prev.filter(menu => menu.id !== menuId))
      if (currentMenu && currentMenu.id === menuId) {
        setCurrentMenu(null)
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Effet initial
  useEffect(() => {
    loadReferenceData()
    
    if (initialYear && initialWeek) {
      loadMenuByWeek(initialYear, initialWeek)
    } else {
      loadAllMenus()
    }
  }, [initialYear, initialWeek])

  return {
    // État
    menus,
    currentMenu,
    mealTypes,
    categories,
    loading,
    error,
    
    // Actions
    loadAllMenus,
    loadMenuByWeek,
    loadReferenceData,
    createMenu,
    updateMenu,
    deleteMenu,
    
    // Utilitaires
    setCurrentMenu,
    setError
  }
}