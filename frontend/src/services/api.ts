import { Achievement, Category, Tag, CreateAchievementDto, UpdateAchievementDto, AchievementFilters, ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Achievement endpoints
  async getAchievements(filters?: AchievementFilters): Promise<PaginatedResponse<Achievement>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const query = params.toString();
    return this.fetch<PaginatedResponse<Achievement>>(`/achievements${query ? `?${query}` : ''}`);
  }

  async getAchievement(id: string): Promise<ApiResponse<Achievement>> {
    return this.fetch<ApiResponse<Achievement>>(`/achievements/${id}`);
  }

  async createAchievement(data: CreateAchievementDto): Promise<ApiResponse<Achievement>> {
    return this.fetch<ApiResponse<Achievement>>('/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAchievement(id: string, data: Partial<UpdateAchievementDto>): Promise<ApiResponse<Achievement>> {
    return this.fetch<ApiResponse<Achievement>>(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAchievement(id: string): Promise<ApiResponse<void>> {
    return this.fetch<ApiResponse<void>>(`/achievements/${id}`, {
      method: 'DELETE',
    });
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.fetch<ApiResponse<Category[]>>('/categories');
  }

  async createCategory(data: { name: string; color?: string }): Promise<ApiResponse<Category>> {
    return this.fetch<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tag endpoints
  async getTags(): Promise<ApiResponse<Tag[]>> {
    return this.fetch<ApiResponse<Tag[]>>('/tags');
  }

  async createTag(data: { name: string }): Promise<ApiResponse<Tag>> {
    return this.fetch<ApiResponse<Tag>>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File upload
  async uploadImages(achievementId: string, files: FileList): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    return this.fetch<ApiResponse<string[]>>(`/achievements/${achievementId}/images`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async deleteImage(imageId: string): Promise<ApiResponse<void>> {
    return this.fetch<ApiResponse<void>>(`/images/${imageId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();