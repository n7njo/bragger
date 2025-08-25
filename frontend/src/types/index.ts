export interface Achievement {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  durationHours?: number;
  categoryId: string;
  impact?: string;
  skillsUsed: string[];
  teamSize?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  category?: Category;
  tags: Tag[];
  images: AchievementImage[];
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface AchievementImage {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface CreateAchievementDto {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  durationHours?: number;
  categoryId: string;
  impact?: string;
  skillsUsed: string[];
  teamSize?: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface UpdateAchievementDto extends Partial<CreateAchievementDto> {}

export interface AchievementFilters {
  search?: string;
  categoryId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'title' | 'startDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Standard API response format for most endpoints
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Achievements endpoint uses a different format
export interface AchievementResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Category DTOs  
export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

export interface CategoryWithStats extends Category {
  achievementCount: number;
}

export interface CategoryFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

// Tag DTOs
export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}

export interface TagWithStats extends Tag {
  usageCount: number;
}

export interface TagFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}