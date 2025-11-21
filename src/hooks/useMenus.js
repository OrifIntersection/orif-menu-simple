import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

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

  // Charger tous les menus (regroupés par semaine)
  const loadAllMenus = async () => {
    try {
      setLoading(true)
      setError(null)
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
      setMenus(Object.values(weeks));
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menus:', err)
    } finally {
      setLoading(false)
    }
  }

  // Charger un menu spécifique (par semaine)
  const loadMenuByWeek = async (year, week) => {
    try {
      setLoading(true)
      setError(null)
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
        .in('meal_date', weekDates);
      if (error) throw error;
      setCurrentMenu(data || []);
      return data;
    } catch (err) {
      setError(err.message)
      console.error('Erreur chargement menu semaine:', err)
      return null;
    } finally {
      setLoading(false)
    }
  }

  // Charger les données de référence (types de repas - ENUMs)
  const loadReferenceData = async () => {
    try {
      // Les types de repas sont maintenant des ENUMs (MIDI/SOIR)
      setMealTypes([
        { code: 'MIDI', label: 'Midi' },
        { code: 'SOIR', label: 'Soir' }
      ])
      // Les catégories sont maintenant dish_type (ENUM dans dishes)
      setCategories([
        { code: 'ENTREE', label: 'Entrée', emoji: '🥗' },
        { code: 'PLAT', label: 'Plat principal', emoji: '🍽️' },
        { code: 'GARNITURE', label: 'Garniture', emoji: '🥔' },
        { code: 'LEGUME', label: 'Légume', emoji: '🥬' },
        { code: 'DESSERT', label: 'Dessert', emoji: '🍰' },
        { code: 'AUTRE', label: 'Autre', emoji: '✨' }
      ])
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