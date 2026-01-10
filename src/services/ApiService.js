const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  static removeToken() {
    localStorage.removeItem('auth_token');
  }

  static getUser() {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  static removeUser() {
    localStorage.removeItem('auth_user');
  }

  static async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        this.removeToken();
        this.removeUser();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  static async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    
    return data;
  }

  static async register(username, email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name })
    });
    
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    
    return data;
  }

  static async getProfile() {
    return this.request('/auth/me');
  }

  static async changePassword(current_password, new_password) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password })
    });
  }

  static async getUsers() {
    return this.request('/auth/users');
  }

  static async createUser(username, email, password, full_name, role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, full_name, role })
    });
  }

  static async updateUser(id, data) {
    return this.request(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async deleteUser(id) {
    return this.request(`/auth/users/${id}`, {
      method: 'DELETE'
    });
  }

  static logout() {
    this.removeToken();
    this.removeUser();
  }

  static async getDishes() {
    return this.request('/dishes');
  }

  static async getDish(id) {
    return this.request(`/dishes/${id}`);
  }

  static async createDish(name, dish_type) {
    return this.request('/dishes', {
      method: 'POST',
      body: JSON.stringify({ name, dish_type })
    });
  }

  static async updateDish(id, name, dish_type) {
    return this.request(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, dish_type })
    });
  }

  static async deleteDish(id) {
    return this.request(`/dishes/${id}`, {
      method: 'DELETE'
    });
  }

  static async getMeals() {
    return this.request('/meals');
  }

  static async getMealsByDate(date) {
    return this.request(`/meals/${date}`);
  }

  static async createMeal(meal_date, meal_type, dish_ids = []) {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify({ meal_date, meal_type, dish_ids })
    });
  }

  static async deleteMeal(id) {
    return this.request(`/meals/${id}`, {
      method: 'DELETE'
    });
  }

  static async getMenuByWeek(year, week) {
    return this.request(`/meals/week/${year}/${week}`);
  }

  static async getAvailableYears() {
    return this.request('/meals/years');
  }

  static async getAvailableWeeks() {
    return this.request('/meals/available');
  }

  static async getMenuForDate(date) {
    const meals = await this.request(`/meals/${date}`);
    return meals.map(meal => ({
      ...meal,
      meals_dishes: meal.dishes ? meal.dishes.map(d => ({
        dish_id: d.id,
        dishes: d
      })) : []
    }));
  }

  static async getAllDishes() {
    return this.request('/dishes');
  }

  static async getOrCreateDish(name, dishType = 'AUTRE') {
    const dishes = await this.request('/dishes');
    const existing = dishes.find(d => d.name === name && d.dish_type === dishType);
    if (existing) return existing;
    
    return this.request('/dishes', {
      method: 'POST',
      body: JSON.stringify({ name, dish_type: dishType })
    });
  }

  static async assignDishToMealByType(mealDate, mealType, dishType, dishId) {
    return this.request('/meals/assign', {
      method: 'POST',
      body: JSON.stringify({ meal_date: mealDate, meal_type: mealType, dish_type: dishType, dish_id: dishId })
    });
  }

  static async removeDishFromMealByType(mealDate, mealType, dishType) {
    return this.request('/meals/remove-dish', {
      method: 'POST',
      body: JSON.stringify({ meal_date: mealDate, meal_type: mealType, dish_type: dishType })
    });
  }

  static async clearMealByType(mealDate, mealType) {
    return this.request('/meals/clear', {
      method: 'POST',
      body: JSON.stringify({ meal_date: mealDate, meal_type: mealType })
    });
  }

  static async getAllMenus() {
    const meals = await this.request('/meals');
    const weeks = {};
    meals.forEach(meal => {
      const d = new Date(meal.meal_date);
      const year = d.getFullYear();
      const jan1 = new Date(year, 0, 1);
      const days = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
      const key = `${year}-W${weekNum}`;
      if (!weeks[key]) weeks[key] = { year, weekNum, dates: [] };
      if (!weeks[key].dates.includes(meal.meal_date)) {
        weeks[key].dates.push(meal.meal_date);
      }
    });
    return Object.values(weeks);
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}

export default ApiService;
