export interface Achievement {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  durationHours?: number;
  categoryId: string;
  impact?: string;
  skillsUsed: string[];
  teamSize?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface AchievementImage {
  id: string;
  achievementId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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