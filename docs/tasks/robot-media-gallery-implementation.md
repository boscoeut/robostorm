# Task: Robot Media Gallery Implementation

## Overview
Implement a comprehensive media gallery system for robots that allows admin users to upload, manage, and organize images and videos. The system will store media files in Supabase Storage, provide a profile image selection feature for each robot, and ensure proper admin-only access controls.

## User Story
As an admin user, I want to upload and manage media files (images and videos) for robots so that I can create rich visual content for each robot profile. As a regular user, I want to view high-quality media galleries for robots so that I can better understand and evaluate different robot models.

## Requirements
- [ ] Admin-only media upload functionality with drag-and-drop interface
- [ ] Supabase Storage integration for secure file storage
- [ ] Support for multiple image formats (JPEG, PNG, WebP) and video formats (MP4, WebM)
- [ ] Image optimization and thumbnail generation
- [ ] Profile image selection for robots from uploaded media
- [ ] Media gallery display on robot detail pages
- [ ] File size limits and validation
- [ ] Admin media management interface
- [ ] Responsive design for mobile and desktop
- [ ] Proper error handling and user feedback

## Technical Implementation

### Frontend Changes
- **Components to Create**:
  - `MediaUpload.tsx` - Drag-and-drop upload component with progress indicators
  - `MediaGallery.tsx` - Display gallery of robot media with lightbox functionality
  - `MediaManager.tsx` - Admin interface for managing robot media
  - `ProfileImageSelector.tsx` - Component for selecting robot profile image
  - `ImagePreview.tsx` - Reusable image preview component with loading states

- **Components to Modify**:
  - `RobotDetailsPage.tsx` - Add media gallery tab and profile image display
  - `AdminPage.tsx` - Add media management section
  - `RobotDatabasePage.tsx` - Update robot cards to show profile images

- **State Management Updates**:
  - Add media-related state to robot store
  - Implement upload progress tracking
  - Add media cache management

- **UI/UX Considerations**:
  - Drag-and-drop upload with visual feedback
  - Image optimization and lazy loading
  - Mobile-responsive gallery layout
  - Loading states and error handling
  - Accessibility compliance (alt text, keyboard navigation)

### Backend Changes
- **MCP Server Tool Updates**:
  - `media-handling.ts` - New tool for media operations
    - `uploadMedia` - Handle file uploads to Supabase Storage
    - `deleteMedia` - Remove media files and database records
    - `updateMediaMetadata` - Update media titles, captions, alt text
    - `setProfileImage` - Set robot profile image
    - `getRobotMedia` - Fetch media for specific robot

- **Database Changes**:
  - Leverage existing `robot_media` table (already created in migration 002)
  - Add Supabase Storage buckets for robot media
  - Implement storage policies for admin-only uploads
  - Add media validation and processing functions

### Database Changes
- **Storage Bucket Creation** (new migration file in `supabase/migrations/`):
  - Create `robot-media` bucket in Supabase Storage
  - Configure bucket policies for admin uploads and public reads
  - Set up image transformation rules for thumbnails

- **RLS Policies Updates**:
  - Admin-only policies for media upload/delete operations
  - Public read access for approved media
  - User role validation for media operations

- **Migration File**: `006_create_robot_media_storage.sql`
  - Storage bucket creation and configuration
  - Storage policies for security
  - Image transformation settings

## Acceptance Criteria
- [ ] Admin users can upload multiple images/videos via drag-and-drop interface
- [ ] Files are automatically optimized and thumbnails generated
- [ ] Profile image can be selected from uploaded media
- [ ] Media gallery displays on robot detail pages with lightbox functionality
- [ ] Non-admin users cannot access upload functionality
- [ ] File size limits are enforced (10MB for images, 100MB for videos)
- [ ] Supported formats: JPEG, PNG, WebP, MP4, WebM
- [ ] Mobile-responsive design works on all screen sizes
- [ ] Loading states and error messages provide clear feedback
- [ ] Media metadata (titles, captions, alt text) can be edited by admins
- [ ] Storage policies prevent unauthorized access

## Testing Requirements
- **Unit Tests**:
  - Media upload component functionality
  - File validation and error handling
  - Profile image selection logic
  - Media gallery display and navigation

- **Integration Tests**:
  - Supabase Storage integration
  - Admin authentication for upload operations
  - Media metadata updates
  - Database operations for media records

- **E2E Test Scenarios**:
  - Admin uploads media files successfully
  - Profile image selection and updates
  - Media gallery navigation and lightbox
  - Non-admin users cannot access upload features
  - Mobile responsiveness across devices

## Dependencies
- **Prerequisites**:
  - Existing robot database schema (migration 002)
  - Admin authentication system (AuthContext)
  - Supabase Storage service access
  - Image processing libraries (Sharp.js or similar)

- **External Dependencies**:
  - Supabase Storage client libraries
  - Image optimization libraries
  - File validation utilities
  - Progress tracking components

- **Technical Constraints**:
  - File size limits based on Supabase Storage quotas
  - Image format support limitations
  - Browser compatibility for drag-and-drop functionality

## Estimated Effort
- **Development Time**: 32 hours
  - Frontend components: 16 hours
  - Backend integration: 8 hours
  - Database setup: 4 hours
  - Testing and refinement: 4 hours

- **Testing Time**: 8 hours
  - Unit tests: 4 hours
  - Integration tests: 2 hours
  - E2E tests: 2 hours

- **Documentation Time**: 4 hours
  - Component documentation: 2 hours
  - API documentation: 1 hour
  - User guide: 1 hour

## Priority
High

## Phase
1

## Implementation Notes

### Storage Architecture
- Use Supabase Storage with organized folder structure: `robots/{robot_id}/media/`
- Implement automatic image resizing and format optimization
- Generate multiple thumbnail sizes for responsive display
- Store metadata in database while files in storage

### Security Considerations
- Admin-only upload policies at storage level
- File type validation on both frontend and backend
- Virus scanning integration (future enhancement)
- Rate limiting for upload operations

### Performance Optimization
- Lazy loading for media galleries
- Image compression and WebP format support
- CDN integration for global media delivery
- Caching strategies for frequently accessed media

### User Experience
- Progressive enhancement for drag-and-drop functionality
- Clear upload progress indicators
- Intuitive media organization and management
- Accessibility features for screen readers

### Future Enhancements
- Video thumbnail generation
- 3D model support
- Batch upload operations
- Media analytics and usage tracking
- Integration with robot comparison features

## File Structure
```
web/src/components/robot/
├── media/
│   ├── MediaUpload.tsx
│   ├── MediaGallery.tsx
│   ├── MediaManager.tsx
│   ├── ProfileImageSelector.tsx
│   └── ImagePreview.tsx
└── ...

supabase/
├── migrations/
│   └── 006_create_robot_media_storage.sql
└── functions/mcp-server/tools/
    └── media-handling.ts
```

## Success Metrics
- Admin users can successfully upload and manage robot media
- Media galleries load quickly and display properly on all devices
- Zero unauthorized access to upload functionality
- 95%+ user satisfaction with media viewing experience
- File upload success rate above 98%
