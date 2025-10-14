# New Project Creation Guide

## Formal Business Idea Section (Fill this section before using this guide)

**Formal Business Idea Description:**

<!-- Fill in your business idea using formal language here -->

**Core Entities:**

<!-- List the main entities for your business idea -->

- Entity 1
- Entity 2
- Entity 3

**Key Features:**

<!-- List the key features of your business idea -->

- Feature 1
- Feature 2
- Feature 3

**Target Users:**

<!-- Describe your target users -->

- User Type 1
- User Type 2

**Technical Requirements:**

<!-- List any specific technical requirements -->

- Requirement 1
- Requirement 2

---

## Project Creation Instructions

This guide provides step-by-step instructions for creating new projects based on the existing architecture of this repository. The business logic is organized in feature modules (like metrics, sso) with a clear separation between backend (NestJS) and frontend (Angular) components.

### 1. Project Structure Overview

The repository follows a monorepo structure with NX workspace. Key directories:

- `apps/` - Main applications (client, server)
- [`libs/feature/`](https://github.com/site15/site15.ru/tree/master/libs/feature/) - Feature modules containing business logic
- `libs/sdk/` - Generated SDKs for API communication
- `libs/generator/` - Code generation utilities

Each feature module has two parts:

1. Backend logic in `libs/feature/{feature-name}` (NestJS)
2. Frontend components in `libs/feature/{feature-name}-afat` (Angular)

### 2. Creating a New Feature Module

#### 2.1. Backend Module Creation

1. Create the backend module directory:

   ```bash
   mkdir -p libs/feature/{feature-name}/src/{lib,prisma,migrations,i18n}
   ```

2. Copy the basic module structure from an existing module like metrics:

   - [`libs/feature/metrics/src/lib/metrics.module.ts`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/metrics.module.ts) → `libs/feature/{feature-name}/src/lib/{feature-name}.module.ts`
   - [`libs/feature/metrics/src/lib/metrics.constants.ts`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/metrics.constants.ts)
   - [`libs/feature/metrics/src/lib/metrics.decorators.ts`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/metrics.decorators.ts)
   - [`libs/feature/metrics/src/lib/metrics.environments.ts`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/metrics.environments.ts)
   - [`libs/feature/metrics/src/lib/metrics.errors.ts`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/metrics.errors.ts)

3. Create the Prisma schema:

   - Copy [`libs/feature/metrics/src/prisma/schema.prisma`](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/prisma/schema.prisma) → `libs/feature/{feature-name}/src/prisma/schema.prisma`
   - Modify the schema to match your business entities

4. Configure Prisma generation in schema.prisma:

   ```prisma
   generator client {
     provider      = "prisma-client-js"
     output        = "../generated/prisma-client"
     engineType    = "dataproxy"
     previewFeatures = ["metrics"]
   }

   generator nestjs {
     provider           = "nestjs-mod-prisma"
     output             = "../generated/prisma-nestjs"
     controllerOutputPath = "../controllers/generated"
     controllerBusinessLogic = true
     generateControllers = true
   }
   ```

#### 2.2. Backend Controllers

1. Create controller files in [`libs/feature/{feature-name}/src/lib/controllers/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}/src/lib/controllers/)

2. Follow the pattern from existing controllers like:

   - [metrics-github-user.controller.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/controllers/metrics-github-user.controller.ts)
   - [sso-users.controller.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/sso/src/lib/controllers/sso-users.controller.ts)

3. Key controller patterns:
   - Use proper decorators for authentication/authorization
   - Implement CRUD operations (findMany, findOne, createOne, updateOne, deleteOne)
   - Use DTOs for input validation
   - Handle tenant isolation for multi-tenant applications

#### 2.3. DTOs and Types

1. Create DTO files in [`libs/feature/{feature-name}/src/lib/types/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}/src/lib/types/)

2. Follow the pattern from existing DTOs:

   - [FindManyMetricsArgs.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/types/FindManyMetricsArgs.ts)
   - [CreateFullMetricsUserDto.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/types/CreateFullMetricsUserDto.ts)

3. For relational filters, create specific DTOs extending the base FindManyArgs:
   ```typescript
   export class FindManyEntityWithRelationArgs extends FindManyArgs {
     @ApiPropertyOptional({ type: String })
     @IsOptional()
     @IsUUID()
     relatedEntityId?: string;
   }
   ```

### 3. Frontend Module Creation

#### 3.1. Frontend Module Structure

1. Create the frontend module directory:

   ```bash
   mkdir -p libs/feature/{feature-name}-afat/src/{lib,components,forms,grids,services,i18n}
   ```

2. Copy basic structure from an existing frontend module like metrics-afat:
   - [`libs/feature/metrics-afat/src/lib/components/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/components/)
   - [`libs/feature/metrics-afat/src/lib/forms/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/forms/)
   - [`libs/feature/metrics-afat/src/lib/grids/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/grids/)
   - [`libs/feature/metrics-afat/src/lib/services/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/services/)

#### 3.2. Grid Components

1. Create grid components in [`libs/feature/{feature-name}-afat/src/lib/grids/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}-afat/src/lib/grids/)

2. Follow the pattern from existing grid components:

   - [metrics-github-user-grid.component.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/grids/metrics-github-user-grid/metrics-github-user-grid.component.ts)

3. Key grid component patterns:
   - Implement `OnInit` and `OnChanges` lifecycle hooks
   - Use BehaviorSubject for state management
   - Implement search, pagination, and sorting
   - Support view mode for embedding in other components
   - Pass relational inputs as @Input() properties

#### 3.3. Services

1. Create service files in [`libs/feature/{feature-name}-afat/src/lib/services/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}-afat/src/lib/services/)

2. Follow the pattern from existing services:

   - [metrics-github-user.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user.service.ts)
   - [metrics-github-user-mapper.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user-mapper.service.ts)
   - [metrics-github-user-form.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user-form.service.ts)

3. Key service patterns:
   - API services wrap REST calls and handle data transformation
   - Mapper services convert between API interfaces and model objects
   - Form services configure Formly fields with validation

### 4. Integration Steps

#### 4.1. Module Registration

1. Register your backend module in the main server application:

   - Update [`apps/server/src/main.ts`](https://github.com/site15/site15.ru/blob/master/apps/server/src/main.ts)

2. Register your frontend module:
   - Update [`apps/client/src/app/app.config.ts`](https://github.com/site15/site15.ru/blob/master/apps/client/src/app/app.config.ts)

#### 4.2. SDK Generation

1. After creating your backend controllers, generate the SDK:

   ```bash
   npm run generate -- --project=server
   ```

2. Update frontend services to use the new API methods:
   - Pass all filter parameters in the correct order
   - Handle new DTO types

#### 4.3. Database Migration

1. Create database migrations:

   ```bash
   npm run pg-flyway:create:{feature-name} --args=InitialSetup
   ```

2. Apply migrations:
   ```bash
   npm run pg-flyway:migrate:{feature-name}
   ```

### 5. Best Practices

#### 5.1. Backend Best Practices

1. **Controller Implementation:**

   - Explicitly list fields during insertion and updating operations
   - Skip relational fields in explicit field listing and handle separately using Prisma's `connect` syntax
   - Use conditional field assignment for optional fields
   - Create specific DTOs for handling relational filters in findMany operations

2. **DTO Usage:**

   - Extended DTOs should not contain fields that are automatically managed by the system
   - Use base DTOs for fields that should be explicitly provided by the user
   - Create specific DTOs for findMany operations that require relational filters

3. **Relation Handling:**
   - Define bidirectional relations with proper naming conventions
   - Use specific field names for relations to avoid ambiguity
   - Carefully consider cascade operations for delete operations

#### 5.2. Frontend Best Practices

1. **Grid Component Implementation:**

   - Grid components should have input properties for relational fields
   - Use relational fields as filters in the `loadMany` method
   - Pass relational fields to form components in the `showCreateOrUpdateModal` method
   - Grid components should support view mode with custom title display instead of action buttons
   - Implement `OnChanges` lifecycle hook to detect changes in relational inputs and trigger data reload

2. **Form Component Implementation:**

   - Form components should accept relational field inputs from grid components
   - Include relational fields in the data object when creating new records
   - Pass relational field values to modal form components via `nzData` property

3. **Service Implementation:**
   - Pass all filter parameters from the filters object to API calls in the correct order
   - Maintain consistency between frontend service method signatures and backend controller method signatures
   - Include relational filter parameters in service method calls following the standard parameter order

### 6. Documentation and Testing

1. **Documentation:**

   - Update [QODER_RULES.md](https://github.com/site15/site15.ru/blob/master/QODER_RULES.md) with any new patterns
   - Update [QODER_RULES_BY_CODE.md](https://github.com/site15/site15.ru/blob/master/QODER_RULES_BY_CODE.md) with code examples
   - Add README files for new modules

2. **Testing:**
   - Write unit tests for services and components
   - Write integration tests for complex workflows
   - Test edge cases and error conditions

### 7. Deployment

1. **Build Process:**

   ```bash
   npm run build:prod
   ```

2. **Deployment:**
   - Update environment configurations
   - Run database migrations
   - Deploy applications

This guide provides a comprehensive framework for creating new projects based on the existing architecture. Follow the patterns established in the metrics and sso modules to maintain consistency across the codebase.
