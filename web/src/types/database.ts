// Database type definitions for Electric Vehicle Data Hub
// These types match the Supabase database schema

export interface Manufacturer {
  id: string
  name: string
  country?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  manufacturer_id: string
  model: string
  year: number // Keep for reference but not used for uniqueness
  model_year?: number // Alternative year field for reference
  trim?: string
  body_style?: string
  is_electric: boolean
  is_currently_available: boolean // New field to track current availability
  profile_image_url?: string
  profile_image_path?: string
  created_at: string
  updated_at: string
  // Relations
  manufacturer?: Manufacturer
  specifications?: VehicleSpecification
  images?: VehicleImage[]
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  image_path: string
  image_name: string
  image_type?: string
  file_size?: number
  width?: number
  height?: number
  alt_text?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VehicleSpecification {
  id: string
  vehicle_id: string
  battery_capacity_kwh?: number
  range_miles?: number
  power_hp?: number
  torque_lb_ft?: number
  acceleration_0_60?: number
  top_speed_mph?: number
  weight_lbs?: number
  length_inches?: number
  width_inches?: number
  height_inches?: number
  cargo_capacity_cu_ft?: number
  seating_capacity?: number
  msrp_usd?: number
  created_at: string
  updated_at: string
  // Relations
  vehicle?: Vehicle
}



export interface NewsArticle {
  id: string
  title: string // VARCHAR(1000)
  content?: string
  summary?: string // VARCHAR(1000)
  source_url?: string // VARCHAR(1000)
  source_name?: string // VARCHAR(500)
  published_date?: string
  category?: string // VARCHAR(200)
  tags?: string[]
  image_url?: string
  image_path?: string
  image_name?: string
  image_size?: number
  image_width?: number
  image_height?: number
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  favorite_vehicles?: string[]
  search_history?: any
  filter_preferences?: any
  notification_settings?: any
  created_at: string
  updated_at: string
}

// Extended types for API responses
export interface VehicleWithDetails extends Vehicle {
  manufacturer: Manufacturer
  specifications: VehicleSpecification
}

export interface CurrentVehicle extends Vehicle {
  is_currently_available: true
  manufacturer: Manufacturer
  specifications?: VehicleSpecification
}

export interface ManufacturerWithVehicles extends Manufacturer {
  vehicles: Vehicle[]
}

// Filter and search types
export interface VehicleFilters {
  manufacturer_id?: string
  body_style?: string
  is_electric?: boolean
  is_currently_available?: boolean // Filter for current models only
  range_min?: number
  range_max?: number
  price_min?: number
  price_max?: number
}

export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  date_from?: string
  date_to?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Real-time subscription types
export interface RealtimeSubscription {
  id: string
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  callback: (payload: any) => void
}

// Database operation types
export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete'

export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// Utility types
export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  field: string
  direction: SortDirection
}

export interface PaginationOptions {
  page: number
  pageSize: number
  sortBy?: SortOption
}
