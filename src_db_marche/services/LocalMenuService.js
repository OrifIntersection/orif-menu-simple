// Service de stockage local pour les menus (dev/test)

const LOCAL_KEY = 'menus_local';

export const LocalMenuService = {
  // Récupérer tous les menus
  getAllMenus() {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Ajouter ou mettre à jour un menu
  saveMenu(menu) {
    const menus = LocalMenuService.getAllMenus();
    const idx = menus.findIndex(m => m.year === menu.year && m.week_number === menu.week_number);
    if (idx >= 0) {
      menus[idx] = menu;
    } else {
      menus.push(menu);
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(menus));
  },

  // Supprimer un menu
  deleteMenu(year, week_number) {
    let menus = LocalMenuService.getAllMenus();
    menus = menus.filter(m => !(m.year === year && m.week_number === week_number));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(menus));
  },

  // Récupérer un menu par semaine
  getMenuByWeek(year, week_number) {
    const menus = LocalMenuService.getAllMenus();
    return menus.find(m => m.year === year && m.week_number === week_number) || null;
  }
};
