const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:3001';

export interface ApiCabin {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  featured: boolean;
}

export interface ApiSettings {
  [key: string]: any;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Cabins
  async getCabins(): Promise<ApiCabin[]> {
    return this.request('/cabins');
  }

  async getCabin(id: string): Promise<ApiCabin> {
    return this.request(`/cabins/${id}`);
  }

  async createCabin(cabin: Omit<ApiCabin, 'id'>): Promise<ApiCabin> {
    return this.request('/cabins', {
      method: 'POST',
      body: JSON.stringify(cabin),
    });
  }

  async updateCabin(id: string, cabin: Omit<ApiCabin, 'id'>): Promise<ApiCabin> {
    return this.request(`/cabins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cabin),
    });
  }

  async deleteCabin(id: string): Promise<void> {
    return this.request(`/cabins/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin
  async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async updateCredentials(username: string, password: string): Promise<{ success: boolean; message: string }> {
    return this.request('/admin/credentials', {
      method: 'PUT',
      body: JSON.stringify({ username, password }),
    });
  }

  async getAdminPath(): Promise<{ path: string }> {
    return this.request('/admin/path');
  }

  async updateAdminPath(path: string): Promise<{ success: boolean; message: string }> {
    return this.request('/admin/path', {
      method: 'PUT',
      body: JSON.stringify({ path }),
    });
  }

  // Settings
  async getSettings(): Promise<ApiSettings> {
    return this.request('/settings');
  }

  async updateSettings(settings: ApiSettings): Promise<{ success: boolean; message: string }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // File upload - multiple files
  async uploadImages(files: File[]): Promise<{ imageUrls: string[] }> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return { imageUrls: results.map(result => result.imageUrl) };
  }

  // File upload - single file
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();