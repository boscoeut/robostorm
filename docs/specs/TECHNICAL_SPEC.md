# Technical Specification
## RoboStorm - Humanoid Robot Database Website

### 1. Architecture Overview

RoboStorm follows a modern full-stack architecture with a React frontend and Supabase backend, designed for scalability, performance, and maintainability.

#### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │   Edge Functions│
│   (Frontend)    │◄──►│   (Database +   │◄──►│   (Serverless)  │
│                 │    │   Auth + API)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Technology Stack

#### Frontend Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with full type coverage
- **Vite**: Fast build tool and development server
- **Zustand**: Lightweight state management
- **Shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Server state management and caching

#### Backend Technologies
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Storage for media files
- **Supabase Edge Functions**: Serverless functions for complex operations
- **Row Level Security (RLS)**: Database-level security policies

#### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing

### 3. Project Structure

```
robostorm/
├── web/                          # Frontend React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/              # Shadcn/ui components
│   │   │   ├── forms/           # Form components
│   │   │   ├── layout/          # Layout components
│   │   │   └── robot/           # Robot-specific components
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── RobotDetailPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── stores/              # Zustand stores
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   └── lib/                 # Third-party library configurations
│   ├── public/                  # Static assets
│   └── package.json
├── supabase/
│   ├── functions/               # Edge functions
│   │   └── mcp-server/          # MCP server with multiple tools
│   │       ├── tools/           # Individual tool implementations
│   │       │   ├── robot-crud.ts    # Robot CRUD operations
│   │       │   ├── search.ts        # Advanced search logic
│   │       │   ├── analytics.ts     # Analytics and reporting
│   │       │   ├── import.ts        # Data import utilities
│   │       │   ├── user-management.ts # User operations
│   │       │   ├── media-handling.ts  # Media processing
│   │       │   ├── reviews.ts        # Review management
│   │       │   └── recommendations.ts # AI recommendations
│   │       └── index.ts             # MCP server entry point
│   ├── migrations/              # Database migrations (ALL migration files go here)
│   └── seed/                    # Seed data
└── docs/                        # Documentation
    └── specs/                   # Project specifications
```

### 4. Frontend Architecture

#### 4.1 Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Compound Components**: Complex UI patterns using compound component pattern
- **Custom Hooks**: Reusable logic extraction for state and side effects
- **Media Components**: Specialized components for image/video upload and gallery display

#### 4.2 State Management Strategy
```typescript
// Zustand stores structure
stores/
├── authStore.ts          # User authentication state
├── robotStore.ts         # Robot data and search state
├── uiStore.ts           # UI state (modals, loading, etc.)
└── filterStore.ts       # Search and filter state
```

#### 4.3 Routing Strategy
```typescript
// React Router configuration
/                           # Home page with featured robots
/search                     # Search and filter robots
/robot/:id                  # Individual robot detail page
/compare                    # Robot comparison page
/profile                    # User profile page
/admin                      # Admin dashboard
/admin/robots               # Robot management
/admin/users                # User management
```

#### 4.4 API Integration
- **Supabase Client**: Direct database queries for simple operations
- **MCP Server**: Single edge function with multiple tools for complex operations
- **React Query**: Caching, background updates, and optimistic updates

**MCP Client Integration:**
```typescript
// Frontend MCP client service
class MCPService {
  private supabase: SupabaseClient;
  
  async callTool(tool: string, action: string, parameters: any) {
    const { data, error } = await this.supabase.functions.invoke('mcp-server', {
      body: { tool, action, parameters }
    });
    return { data, error };
  }
  
  // Robot operations
  async getRobots(filters?: RobotFilters) {
    return this.callTool('robot-crud', 'list', { filters });
  }
  
  async createRobot(robotData: CreateRobotData) {
    return this.callTool('robot-crud', 'create', { robotData });
  }
  
  // Search operations
  async searchRobots(query: string, filters?: SearchFilters) {
    return this.callTool('search', 'robots', { query, filters });
  }
}
```

### 5. Database Design

#### 5.1 Core Tables
- **robots**: Main robot information
- **manufacturers**: Robot manufacturer data
- **categories**: Robot categorization
- **specifications**: Technical specifications
- **media**: Images, videos, and documents
- **reviews**: User reviews and ratings
- **users**: User accounts and profiles

#### 5.2 Relationships
- Many-to-many relationships for robots and categories
- One-to-many for manufacturer to robots
- One-to-many for robot to specifications
- One-to-many for robot to media files
- One-to-many for robot to reviews

### 6. Authentication & Authorization

#### 6.1 User Roles
- **Anonymous**: Browse and search robots
- **Registered**: Add reviews, favorites, and personal lists
- **Moderator**: Edit robot information and moderate content
- **Admin**: Full system access and user management

#### 6.2 Authentication Flow
1. Email/password registration and login
2. Social authentication (Google, GitHub)
3. Magic link authentication
4. Password reset functionality

#### 6.3 Authorization Policies
- Row Level Security (RLS) policies for data access
- Role-based access control (RBAC)
- API endpoint protection with JWT tokens

### 7. Performance Optimization

#### 7.1 Frontend Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker for offline capability

#### 7.2 Backend Optimization
- **Database Indexing**: Optimized indexes for search queries
- **Connection Pooling**: Efficient database connections
- **CDN Integration**: Global content delivery
- **Caching**: Redis for frequently accessed data

#### 7.3 Search Performance
- **Full-Text Search**: PostgreSQL full-text search capabilities
- **Search Indexing**: Optimized search indexes
- **Query Optimization**: Efficient database queries
- **Pagination**: Cursor-based pagination for large datasets

### 8. Security Implementation

#### 8.1 Data Security
- **Encryption**: Data encrypted in transit and at rest
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy (CSP)

#### 8.2 Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Secure session handling
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing

### 9. API Design

#### 9.1 MCP Server API Endpoints
```typescript
// Single MCP server endpoint
POST   /functions/v1/mcp-server  # Main MCP server endpoint

// MCP Request Structure
interface MCPRequest {
  tool: string;              // Tool name (e.g., 'robot-crud', 'search')
  action: string;            // Action within tool (e.g., 'create', 'read', 'update')
  parameters: Record<string, any>;  // Tool-specific parameters
  context?: {
    userId?: string;
    userRole?: string;
    sessionId?: string;
  };
}

// Example MCP Requests
// Robot operations
{
  tool: 'robot-crud',
  action: 'list',
  parameters: { page: 1, limit: 20, filters: {...} }
}

{
  tool: 'robot-crud',
  action: 'create',
  parameters: { robotData: {...} }
}

// Search operations
{
  tool: 'search',
  action: 'robots',
  parameters: { query: 'humanoid', filters: {...} }
}

// User operations
{
  tool: 'user-management',
  action: 'getProfile',
  parameters: { userId: 'uuid' }
}

// Analytics
{
  tool: 'analytics',
  action: 'trackEvent',
  parameters: { event: 'robot_view', robotId: 'uuid' }
}
```

#### 9.2 MCP Server Architecture

The application uses a single Model Context Protocol (MCP) server edge function that provides multiple tools for comprehensive backend operations. This approach offers several advantages:

**Benefits of MCP Server Approach:**
- **Unified Interface**: Single endpoint for all backend operations
- **Tool Composition**: Easy combination of multiple tools in single requests
- **Better Performance**: Reduced cold start overhead compared to multiple functions
- **Simplified Deployment**: Single function to deploy and maintain
- **Enhanced Security**: Centralized authentication and authorization

**MCP Server Tools:**
- **robot-crud**: Handle complex robot operations (create, read, update, delete)
- **search**: Advanced search with filtering and sorting capabilities
- **analytics**: Track user behavior and system metrics
- **import**: Bulk data import from external sources
- **user-management**: User profile and preference management
- **media-handling**: Admin-only image and video upload processing with Supabase Storage
- **reviews**: Review and rating management
- **recommendations**: AI-powered robot recommendations

**MCP Server Structure:**
```typescript
// mcp-server/index.ts - Main server entry point
interface MCPServer {
  tools: {
    [key: string]: MCPTool;
  };
  handleRequest(request: MCPRequest): Promise<MCPResponse>;
}

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute(params: any): Promise<any>;
}
```

**Tool Communication:**
- Each tool is implemented as a separate module within the MCP server
- Tools can communicate with each other through shared context
- Database operations are centralized through a shared Supabase client
- Authentication and authorization are handled at the server level

### 10. Database Migrations

#### 10.1 Migration File Location
**IMPORTANT**: All database migration files must be placed in the `supabase/migrations/` directory.

```
supabase/
├── migrations/                   # ALL database migration files go here
│   ├── 001_create_user_roles.sql
│   ├── 002_create_robots_table.sql
│   ├── 003_add_search_indexes.sql
│   └── ...
```

#### 10.2 Migration Naming Convention
- Use sequential numbering: `001_`, `002_`, `003_`, etc.
- Use descriptive names: `create_user_roles`, `add_search_indexes`
- Use snake_case for file names
- Always include the `.sql` extension

#### 10.3 Migration Best Practices
- **One migration per logical change**: Don't combine unrelated schema changes
- **Include rollback instructions**: Comment how to undo the migration if needed
- **Test migrations**: Always test on development environment first
- **Use IF NOT EXISTS**: Prevent errors if migration runs multiple times
- **Document dependencies**: Note which migrations depend on others

#### 10.4 Running Migrations
```bash
# Apply all pending migrations
supabase db push

# Apply specific migration (development)
supabase db reset --with-data

# Check migration status
supabase migration list
```

### 11. Development Workflow

#### 11.1 Local Development
```bash
# Frontend development
cd web
npm install
npm run dev

# Supabase local development
supabase start
supabase functions serve

# MCP server development
cd supabase/functions/mcp-server
npm install
npm run dev
```

#### 10.2 Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and database integration testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load testing and performance monitoring

#### 10.3 Deployment Pipeline
1. **Development**: Local development with hot reload
2. **Staging**: Automated deployment to staging environment
3. **Production**: Manual approval for production deployment
4. **Monitoring**: Real-time monitoring and error tracking

### 12. Monitoring & Analytics

#### 12.1 Application Monitoring
- **Error Tracking**: Real-time error monitoring and alerting
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: User behavior and engagement tracking
- **System Metrics**: Server performance and resource usage

#### 12.2 Business Metrics
- **User Engagement**: Page views, session duration, bounce rate
- **Content Metrics**: Robot views, search queries, favorites
- **Conversion Metrics**: Registration rate, user retention
- **Performance Metrics**: Page load times, API response times

### 13. Scalability Considerations

#### 13.1 Horizontal Scaling
- **Stateless Architecture**: No server-side sessions
- **Database Sharding**: Horizontal database scaling
- **CDN Distribution**: Global content delivery
- **Microservices**: Modular backend services

#### 13.2 Performance Scaling
- **Database Optimization**: Query optimization and indexing
- **Caching Layers**: Multiple caching strategies
- **Load Balancing**: Traffic distribution across servers
- **Auto-scaling**: Automatic resource scaling based on demand

### 14. Future Technical Considerations

#### 14.1 Mobile Application
- **React Native**: Cross-platform mobile development
- **Shared Codebase**: Reuse of business logic and API layer
- **Offline Support**: Local data caching and synchronization

#### 14.2 Advanced Features
- **Real-time Updates**: WebSocket connections for live data
- **AI Integration**: Machine learning for recommendations
- **AR/VR Support**: 3D robot visualization
- **API Versioning**: Backward compatibility for API changes

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** January 2025
