# Task Execution Agent Process

## Purpose
This agent creates a comprehensive task implementation plan by analyzing user requirements against existing project specifications and task history. It ensures consistent implementation across the RoboStorm application.

## Agent Input
- **User Description**: Detailed description of the feature/functionality to implement
- **Priority**: High, Medium, or Low (optional)
- **Phase**: 1, 2, or 3 based on project roadmap (optional)

## Agent Process Flow

### 1. Input Analysis
- Parse user input to identify the specific part of the application to implement
- Determine the scope and complexity of the task
- Identify dependencies and prerequisites

### 2. Specification Consultation
- **PRD.md**: Verify alignment with product requirements and user stories
- **TECHNICAL_SPEC.md**: Understand technical implementation approach
- **DATABASE_SPEC.md**: Identify database changes and data requirements
- **taskHistory.md**: Review previously implemented features to avoid duplication

### 3. Task Definition Creation
- Generate detailed task implementation description
- Include acceptance criteria and testing requirements
- Specify deliverables and success metrics
- Store in `/docs/tasks/` folder with standardized naming

### 4. Specification Updates
- Update relevant spec files if task requires changes
- Ensure consistency across all documentation
- Maintain version control and change tracking

### 5. Task History Update
- Add concise summary to `taskHistory.md`
- Include implementation date and key outcomes
- Format for easy future reference and dependency tracking

## Task Definition Template

```markdown
# Task: [TASK_NAME]

## Overview
Brief description of what this task implements

## User Story
As a [user type], I want [functionality] so that [benefit]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Technical Implementation
### Frontend Changes
- Components to create/modify
- State management updates
- UI/UX considerations

### Backend Changes
- MCP server tool updates
- Database schema changes
- API endpoint modifications

### Database Changes
- New tables/columns (create migration files in `supabase/migrations/`)
- Indexes to add (include in migration files)
- RLS policies to update (include in migration files)
- Migration file naming: `00X_descriptive_name.sql`

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Testing Requirements
- Unit tests needed
- Integration tests required
- E2E test scenarios

## Dependencies
- Prerequisites from other tasks
- External dependencies
- Technical constraints

## Estimated Effort
- Development time
- Testing time
- Documentation time

## Priority
[High|Medium|Low]

## Phase
[1|2|3]

## Implementation Notes
Additional considerations and implementation details
```

## Task History Format

```markdown
## [YYYY-MM-DD] - [TASK_NAME]
**Status**: [Completed|In Progress|Blocked]
**Phase**: [1|2|3]
**Priority**: [High|Medium|Low]

### Summary
Brief description of what was implemented

### Key Changes
- Frontend: [changes made]
- Backend: [changes made]
- Database: [changes made]
- Documentation: [updates made]

### Deliverables
- [deliverable 1]
- [deliverable 2]

### Notes
Any important implementation notes or lessons learned

---
```

## Example Agent Tasks

**Task 1**: "Create advanced robot search with filtering by height, weight, and manufacturer"
- **Priority**: High
- **Phase**: 1
- **Agent Action**: Analyze search requirements, create task definition, update database spec for search indexes

**Task 2**: "Add user registration and login system"
- **Priority**: High  
- **Phase**: 1
- **Agent Action**: Review auth requirements, plan Supabase auth integration, update technical spec

**Task 3**: "Build robot comparison tool for side-by-side analysis"
- **Priority**: Medium
- **Phase**: 2
- **Agent Action**: Design comparison UI, plan state management, update PRD with user stories

## Quality Assurance

### Pre-Implementation Checklist
- [ ] Task aligns with PRD requirements
- [ ] Technical approach is feasible
- [ ] Database changes are optimized
- [ ] Migration files are placed in `supabase/migrations/`
- [ ] Migration files follow naming convention
- [ ] No conflicts with existing implementations
- [ ] Dependencies are identified

### Post-Implementation Checklist
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Task history updated
- [ ] Code review completed

## Agent Integration with Development Workflow

1. **Planning Phase**: Agent analyzes requirements and creates detailed implementation plans
2. **Development Phase**: Developer follows task definition for consistent implementation
3. **Review Phase**: Agent verifies completion against acceptance criteria
4. **Documentation Phase**: Agent updates specs and history automatically

## Agent Best Practices

### Analysis Phase
- Always consult existing specifications before creating tasks
- Cross-reference taskHistory.md to avoid duplication
- Identify dependencies and potential conflicts early
- Validate requirements against PRD user stories

### Implementation Planning
- Maintain consistency with established patterns
- Use standardized naming conventions
- Include clear acceptance criteria
- Consider future maintenance and scalability

### Documentation Management
- Update documentation incrementally
- Keep task history concise but informative
- Maintain version control and change tracking
- Ensure consistency across all specification files

### Quality Assurance
- Verify technical feasibility before proceeding
- Validate database changes for performance impact
- Ensure UI/UX consistency with existing design
- Plan comprehensive testing coverage
