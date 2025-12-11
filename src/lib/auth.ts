const AUTH_API = 'https://functions.poehali.dev/297b4f36-b882-46c6-ba52-80f10849610d';
const ADMIN_API = 'https://functions.poehali.dev/cb2be020-2650-4534-bcd7-e875b45625f6';

export interface User {
  id: number;
  email: string;
  username: string;
  energy: number;
  isInfiniteEnergy: boolean;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, username, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout', token })
      });
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async verifyToken(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token })
      });
      
      const data = await response.json();
      if (!response.ok) {
        this.logout();
        return null;
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch {
      this.logout();
      return null;
    }
  },

  async updatePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_password', email, oldPassword, newPassword })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Password update failed');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};

export const adminService = {
  async getStats() {
    const token = authService.getToken();
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || ''
      },
      body: JSON.stringify({ action: 'get_stats' })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data;
  },

  async getUsers() {
    const token = authService.getToken();
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || ''
      },
      body: JSON.stringify({ action: 'get_users' })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
    return data;
  },

  async updateEnergy(userId: number, amount: number, type: string = 'admin_adjustment') {
    const token = authService.getToken();
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || ''
      },
      body: JSON.stringify({ action: 'update_energy', userId, amount, type })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update energy');
    return data;
  },

  async toggleInfiniteEnergy(userId: number) {
    const token = authService.getToken();
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || ''
      },
      body: JSON.stringify({ action: 'toggle_infinite_energy', userId })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to toggle infinite energy');
    return data;
  }
};
