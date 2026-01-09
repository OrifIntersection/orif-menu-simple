import { useState, useEffect } from 'react'
import ApiService from '../services/ApiService'

export const useMenus = (initialYear = null, initialWeek = null) => {
  const [menus, setMenus] = useState([])
  const [currentMenu, setCurrentMenu] = useState(null)
  const [mealTypes, setMealTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAllMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const allMenus = await ApiService.getAllMenus()
      setMenus(allMenus)
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menus:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMenuByWeek = async (year, week) => {
    try {
      setLoading(true)
      setError(null)
      const meals = await ApiService.getMenuByWeek(year, week)
      setCurrentMenu(meals || [])
      return meals
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menu semaine:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadReferenceData = async () => {
    try {
      setMealTypes([
        { code: 'MIDI', label: 'Midi' },
        { code: 'SOIR', label: 'Soir' }
      ])
      setCategories([
        { code: 'ENTREE', label: 'Entree', emoji: '🥗' },
        { code: 'PLAT', label: 'Plat principal', emoji: '🍽️' },
        { code: 'GARNITURE', label: 'Garniture', emoji: '🥔' },
        { code: 'LEGUME', label: 'Legume', emoji: '🥬' },
        { code: 'DESSERT', label: 'Dessert', emoji: '🍰' },
        { code: 'AUTRE', label: 'Autre', emoji: '✨' }
      ])
    } catch (err) {
      console.error('Erreur chargement donnees de reference:', err)
    }
  }

  useEffect(() => {
    loadReferenceData()
    
    if (initialYear && initialWeek) {
      loadMenuByWeek(initialYear, initialWeek)
    } else {
      loadAllMenus()
    }
  }, [initialYear, initialWeek])

  return {
    menus,
    currentMenu,
    mealTypes,
    categories,
    loading,
    error,
    
    loadAllMenus,
    loadMenuByWeek,
    loadReferenceData,
    
    setCurrentMenu,
    setError
  }
}
