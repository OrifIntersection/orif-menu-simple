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

  static isAuthenticated() {
    return !!this.getToken();
  }

  static isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}

export default ApiService;
