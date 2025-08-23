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

export interface UpdateAchievementDto extends Partial<CreateAchievementDto> {
  id: string;
}

export interface AchievementFilters {
  search?: string;
  categoryId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'title' | 'startDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
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