const KEY = "orif_menu_week";

export function loadMenu(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveMenu(menuObj) {
  localStorage.setItem(KEY, JSON.stringify(menuObj));
}
