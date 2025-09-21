# Task: UI Navigation and Header Updates

## Overview
Update the application's navigation menu options and header branding to better reflect the robot-focused purpose of the platform. This includes changing navigation items and updating the header title to "Robot Data Hub".

## User Story
As a user visiting the RoboStorm platform, I want to see clear navigation options that reflect the robot-focused nature of the application (Home, Robot Database, Industry News, Admin Dashboard) and a header that clearly identifies this as the "Robot Data Hub" so that I can easily understand and navigate the platform's robot-related features.

## Requirements
- [ ] Update navigation items to: Home, Robot Database, Industry News, Admin Dashboard
- [ ] Change header title from "Robostorm" to "Robot Data Hub"
- [ ] Update header subtitle to reflect robot context instead of "Electric Vehicle Data Hub"
- [ ] Maintain existing authentication and authorization logic for Admin Dashboard
- [ ] Preserve responsive design and accessibility features

## Technical Implementation

### Frontend Changes
- **Components to modify**:
  - `web/src/stores/layout-store.ts`: Update `allNavigationItems` array
  - `web/src/components/layout/Header.tsx`: Update title and subtitle text
- **State management updates**: No changes to state structure, only content updates
- **UI/UX considerations**: Maintain existing responsive behavior and styling

### Backend Changes
- **MCP server tool updates**: None required
- **Database schema changes**: None required
- **API endpoint modifications**: None required

### Database Changes
- **New tables/columns**: None required
- **Indexes to add**: None required
- **RLS policies to update**: None required
- **Migration files**: None required

## Acceptance Criteria
- [ ] Navigation menu displays exactly: "Home", "Robot Database", "Industry News", "Admin Dashboard"
- [ ] Header title displays "Robot Data Hub" instead of "Robostorm"
- [ ] Header subtitle is updated to reflect robot context
- [ ] Admin Dashboard remains accessible only to admin users
- [ ] All navigation items maintain proper routing functionality
- [ ] Responsive design is preserved across all screen sizes
- [ ] Navigation maintains existing accessibility features

## Testing Requirements
- **Unit tests needed**: Verify navigation items are correctly configured
- **Integration tests required**: Test navigation routing functionality
- **E2E test scenarios**: 
  - Verify all navigation items are visible and clickable
  - Confirm admin dashboard is only visible to admin users
  - Test responsive navigation behavior on mobile devices

## Dependencies
- **Prerequisites from other tasks**: None
- **External dependencies**: None
- **Technical constraints**: Must maintain existing authentication/authorization system

## Estimated Effort
- **Development time**: 30 minutes
- **Testing time**: 15 minutes  
- **Documentation time**: 15 minutes

## Priority
High

## Phase
1

## Implementation Notes
This is a straightforward UI update that changes text content and navigation labels without affecting the underlying functionality. The existing navigation system in `layout-store.ts` already supports the required structure, only the content needs to be updated. The change from "Vehicle Database" to "Robot Database" aligns with the PRD's focus on humanoid robots rather than vehicles.

The header subtitle change should reflect the robot focus while maintaining the professional appearance of the application. Consider using "The IMDB for Humanoid Robots" as mentioned in the PRD, or a shorter version like "Humanoid Robot Database" to maintain consistency with the navigation.
