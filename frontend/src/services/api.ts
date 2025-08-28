import {
  Achievement,
  Category,
  Tag,
  UpdateAchievementDto,
  AchievementFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
  CreateTagDto,
  UpdateTagDto,
  TagFilters,
  ApiResponse,
  AchievementResponse
} from '../types'
import { AchievementFormData } from '../schemas/achievementSchema';

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
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('💥 API request failed:', endpoint, error);
      throw error;
    }
  }

  // Achievement endpoints - uses different response format than other endpoints
  async getAchievements(filters?: AchievementFilters): Promise<AchievementResponse<Achievement[]>> {
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
    return this.fetch<AchievementResponse<Achievement[]>>(`/achievements${query ? `?${query}` : ''}`);
  }

  async getAchievement(id: string): Promise<ApiResponse<Achievement>> {
    return this.fetch<ApiResponse<Achievement>>(`/achievements/${id}`);
  }

  async createAchievement(data: AchievementFormData): Promise<ApiResponse<Achievement>> {
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
  async getCategories(filters?: CategoryFilters): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString();
    return this.fetch<ApiResponse<Category[]>>(`/categories${query ? `?${query}` : ''}`);
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.fetch<ApiResponse<Category>>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    return this.fetch<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    return this.fetch<ApiResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.fetch<ApiResponse<void>>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Tag endpoints
  async getTags(filters?: TagFilters): Promise<ApiResponse<Tag[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString();
    return this.fetch<ApiResponse<Tag[]>>(`/tags${query ? `?${query}` : ''}`);
  }

  async getTag(id: string): Promise<ApiResponse<Tag>> {
    return this.fetch<ApiResponse<Tag>>(`/tags/${id}`);
  }

  async createTag(data: CreateTagDto): Promise<ApiResponse<Tag>> {
    return this.fetch<ApiResponse<Tag>>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: UpdateTagDto): Promise<ApiResponse<Tag>> {
    return this.fetch<ApiResponse<Tag>>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<ApiResponse<void>> {
    return this.fetch<ApiResponse<void>>(`/tags/${id}`, {
      method: 'DELETE',
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