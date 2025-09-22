// Database type definitions for RoboStorm - Humanoid Robot Database
// These types match the Supabase database schema

export interface Manufacturer {
  id: string
  name: string
  slug: string
  website?: string
  country?: string
  founded_year?: number
  description?: string
  logo_url?: string
  headquarters_address?: string
  contact_email?: string
  social_links?: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Robot {
  id: string
  name: string
  slug: string
  manufacturer_id: string
  model_number?: string
  
  // Version tracking
  version: string
  is_latest_version: boolean
  parent_robot_id?: string
  
  // Release information
  release_date?: string
  announcement_date?: string
  status: string // active, discontinued, prototype, concept, development
  
  // Physical Specifications
  height_cm?: number
  height_inches?: number
  weight_kg?: number
  weight_lbs?: number
  
  // Power and Performance
  battery_type?: string
  battery_capacity_wh?: number
  battery_life_hours?: number
  charging_time_hours?: number
  power_consumption_watts?: number
  
  // Movement and Capabilities
  walking_speed_kmh?: number
  walking_speed_mph?: number
  max_payload_kg?: number
  max_payload_lbs?: number
  degrees_of_freedom?: number
  joint_count?: number
  
  // Environmental Specs
  operating_temperature_min?: number
  operating_temperature_max?: number
  ip_rating?: string
  
  // AI and Software
  ai_capabilities?: string[]
  operating_system?: string
  programming_languages?: string[]
  sdk_available: boolean
  api_available: boolean
  
  // Sensors and Hardware
  sensors?: Record<string, any>
  cameras_count: number
  microphones_count: number
  speakers_count: number
  
  // Computing Specifications
  cpu_model?: string
  gpu_model?: string
  ram_gb?: number
  storage_gb?: number
  
  // Connectivity
  wifi_standards?: string[]
  bluetooth_version?: string
  ethernet_ports: number
  usb_ports: number
  other_connectivity?: Record<string, any>
  
  // Pricing and Availability
  estimated_price_usd?: number
  price_range_min_usd?: number
  price_range_max_usd?: number
  availability_status?: string
  lead_time_weeks?: number
  
  // Content and Media
  description?: string
  features?: string[]
  applications?: string[]
  use_cases?: string[]
  
  // SEO and Display
  meta_title?: string
  meta_description?: string
  featured_image_url?: string
  gallery_images?: string[]
  video_urls?: string[]
  
  // Ratings and Engagement
  is_featured: boolean
  is_verified: boolean
  is_prototype: boolean
  view_count: number
  favorite_count: number
  rating_average: number
  rating_count: number
  
  // External Links
  official_website?: string
  documentation_url?: string
  purchase_url?: string
  wikipedia_url?: string
  
  // Timestamps and Audit
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  manufacturer?: Manufacturer
  specifications?: RobotSpecification[]
  media?: RobotMedia[]
  reviews?: RobotReview[]
}

export interface RobotMedia {
  id: string
  robot_id: string
  file_type: string // image, video, document, 3d_model, datasheet
  file_name: string
  file_url: string
  thumbnail_url?: string
  file_size_bytes?: number
  mime_type?: string
  
  // Image/Video specific
  width?: number
  height?: number
  duration_seconds?: number // for videos
  
  // Metadata
  title?: string
  alt_text?: string
  caption?: string
  description?: string
  tags?: string[]
  
  // Organization
  sort_order: number
  is_primary: boolean
  is_featured: boolean
  
  // Rights and Attribution
  copyright_info?: string
  license_type?: string
  source_url?: string
  attribution?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  created_by?: string
}

export interface RobotSpecification {
  id: string
  robot_id: string
  category: string // mechanical, electrical, software, sensors, etc.
  name: string
  value: string
  unit?: string
  description?: string
  source_url?: string
  is_verified: boolean
  sort_order: number
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  // Relations
  robot?: Robot
}

export interface RobotReview {
  id: string
  robot_id: string
  user_id: string
  
  // Review Content
  rating: number // 1-5
  title?: string
  content?: string
  pros?: string[]
  cons?: string[]
  
  // Review Context
  usage_context?: string // research, industrial, personal, educational
  usage_duration?: string // days, weeks, months, years
  experience_level?: string // beginner, intermediate, expert
  
  // Verification and Quality
  verified_purchase: boolean
  verified_user: boolean
  is_expert_review: boolean
  
  // Engagement
  helpful_count: number
  not_helpful_count: number
  reply_count: number
  
  // Moderation
  is_approved: boolean
  is_flagged: boolean
  moderation_notes?: string
  
  // Timestamps
  created_at: string
  updated_at: string
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
  is_featured?: boolean
  view_count?: number
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  favorite_robots?: string[]
  search_history?: any
  filter_preferences?: any
  notification_settings?: any
  created_at: string
  updated_at: string
}

// Extended types for API responses
export interface RobotWithDetails extends Robot {
  manufacturer: Manufacturer
  specifications: RobotSpecification[]
  media: RobotMedia[]
}

export interface RobotWithMedia extends Robot {
  manufacturer: Manufacturer
  media: RobotMedia[]
  primaryImage?: RobotMedia
}

export interface ManufacturerWithRobots extends Manufacturer {
  robots: Robot[]
}

// Filter and search types
export interface RobotFilters {
  manufacturer_id?: string
  status?: string
  is_featured?: boolean
  is_verified?: boolean
  is_prototype?: boolean
  height_min?: number
  height_max?: number
  weight_min?: number
  weight_max?: number
  price_min?: number
  price_max?: number
  rating_min?: number
  ai_capabilities?: string[]
  applications?: string[]
}

export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  date_from?: string
  date_to?: string
}

export interface NewsFilters {
  category?: string
  tags?: string[]
  is_featured?: boolean
  date_from?: string
  date_to?: string
  source_name?: string
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

// Media-specific types
export interface MediaUploadRequest {
  robotId: string
  file: File
  title?: string
  altText?: string
  caption?: string
  tags?: string[]
  isPrimary?: boolean
  isFeatured?: boolean
}

export interface MediaUpdateRequest {
  mediaId: string
  title?: string
  altText?: string
  caption?: string
  tags?: string[]
  sortOrder?: number
  isPrimary?: boolean
  isFeatured?: boolean
}

export interface MediaUploadResponse {
  success: boolean
  data?: RobotMedia
  error?: string
}

export interface MediaListResponse {
  success: boolean
  data?: RobotMedia[]
  error?: string
}
