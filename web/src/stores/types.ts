// Common types used across stores

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
