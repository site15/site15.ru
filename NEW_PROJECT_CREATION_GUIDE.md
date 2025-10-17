# New Project Creation Guide

## Formal Business Idea Section (Fill this section before using this guide)

**Formal Business Idea Description:**

<!-- Fill in your business idea using formal language here -->
<!-- AI Assistance: To automatically fill this section, provide a detailed description of your business idea to an AI assistant and ask it to generate a formal business description, core entities, key features, target users, and technical requirements based on your input. -->

**Core Entities:**

<!-- List the main entities for your business idea -->
<!-- AI Assistance: Based on your business idea, the AI can help identify and list the core entities needed for your application. -->

- Entity 1
- Entity 2
- Entity 3

**Key Features:**

<!-- List the key features of your business idea -->
<!-- AI Assistance: The AI can help break down your business idea into specific features and functionalities. -->

- Feature 1
- Feature 2
- Feature 3

**Target Users:**

<!-- Describe your target users -->
<!-- AI Assistance: The AI can help identify and describe your target user groups based on your business idea. -->

- User Type 1
- User Type 2

**Technical Requirements:**

<!-- List any specific technical requirements -->
<!-- AI Assistance: The AI can help identify technical requirements based on your business features and target users. -->

- Requirement 1
- Requirement 2

---

## Project Creation Instructions

This guide provides step-by-step instructions for creating new projects based on the existing architecture of this repository. The business logic is organized in feature modules (like metrics, sso) with a clear separation between backend (NestJS) and frontend (Angular) components.

<!-- !!TODO!!: Add explanation of the monorepo architecture benefits and how NX workspace helps with project organization -->
<!-- Filled: NX workspace provides a monorepo architecture that allows managing multiple applications and libraries in a single repository. Benefits include:
1. Shared code and dependencies across projects
2. Atomic commits across all projects
3. Simplified dependency management
4. Improved collaboration between teams
5. Consistent tooling and configuration
6. Better code reuse and maintainability
7. Easier refactoring across projects
8. Centralized build and test processes -->

### 1. Downloading and Setting Up the Repository

Before creating a new project, you need to download and set up the repository:

1. **Download the repository:**

   ```bash
   # Download the repository as a ZIP file
   curl -L -o master.zip https://github.com/site15/site15.ru/archive/refs/heads/master.zip
   ```

2. **Extract the repository:**

   ```bash
   # Extract the ZIP file to the current directory
   unzip master.zip -d .

   # Move the contents to the current directory
   mv site15.ru-master/* .

   # Remove the empty directory and ZIP file
   rmdir site15.ru-master
   rm master.zip
   ```

3. **Install dependencies:**

   ```bash
   # Install all project dependencies
   npm install
   ```

4. **Verify the setup:**
   ```bash
   # Check that the project builds correctly
   npm run build
   ```

<!-- !!TODO!!: Add troubleshooting steps for common setup issues (e.g., node version requirements, missing system dependencies) -->
<!-- Filled: Common setup issues and troubleshooting:
1. Node.js version: Ensure you're using Node.js version 18.x (check with `node --version`)
2. npm version: Update to the latest npm version with `npm install -g npm@latest`
3. Python 2.7: Some native modules require Python 2.7 for compilation
4. Build tools: Install build tools for your OS (Windows: windows-build-tools, macOS: Xcode Command Line Tools, Linux: build-essential)
5. Memory issues: Increase Node.js memory limit with `export NODE_OPTIONS=--max_old_space_size=4096`
6. Permission errors: Avoid using sudo with npm install; fix with `sudo chown -R $(whoami) ~/.npm` -->

### 2. Using AI to Fill the Business Idea Section

Before proceeding with project creation, fill in the "Formal Business Idea Section" at the beginning of this document. You can use an AI assistant to help with this:

1. **Provide your business idea** to an AI assistant in natural language
2. **Ask the AI to generate** the following based on your idea:

   - Formal business description
   - Core entities needed for your application
   - Key features and functionalities
   - Target user groups
   - Technical requirements

3. **Copy the AI-generated content** into the appropriate sections in this document

Example prompt for the AI:

> "I want to create a task management application for small teams. Please generate a formal business description, list the core entities, key features, target users, and technical requirements for this application."

<!-- !!TODO!!: Provide more examples of effective AI prompts for different types of applications -->
<!-- Filled: Additional AI prompt examples:
1. E-commerce application: "Create an e-commerce platform for selling handmade crafts. Generate a formal business description, core entities, key features, target users, and technical requirements."
2. Social media platform: "Design a professional networking platform for remote workers. Provide a formal business description, core entities, key features, target users, and technical requirements."
3. Educational platform: "Develop an online learning platform for coding bootcamps. Generate a formal business description, core entities, key features, target users, and technical requirements."
4. Healthcare application: "Create a telemedicine platform for connecting patients with specialists. Provide a formal business description, core entities, key features, target users, and technical requirements."
5. Financial application: "Design a personal finance management tool with budgeting and investment tracking. Generate a formal business description, core entities, key features, target users, and technical requirements." -->

### 3. Project Structure Overview

The repository follows a monorepo structure with NX workspace. Key directories:

- `apps/` - Main applications (client, server)
- [`libs/feature/`](https://github.com/site15/site15.ru/tree/master/libs/feature/) - Feature modules containing business logic
- `libs/sdk/` - Generated SDKs for API communication
- `libs/generator/` - Code generation utilities

Each feature module has two parts:

1. Backend logic in `libs/feature/{feature-name}` (NestJS)
2. Frontend components in `libs/feature/{feature-name}-afat` (Angular)

<!-- Filled: Project structure diagram:
```mermaid
graph TD
    A[Project Root] --> B[apps/]

    A --> C[libs/]
    A --> D[tools/]

    B --> B1[client/]
    B --> B2[server/]

    C --> C1[feature/]
    C --> C2[sdk/]
    C --> C3[generator/]
    C --> C4[shared/]

    C1 --> C11[feature-module/]
    C1 --> C12[feature-module-afat/]

    C11 --> C11a[src/lib/]
    C11 --> C11b[src/prisma/]
    C11 --> C11c[src/migrations/]

    C11a --> C11a1[controllers/]
    C11a --> C11a2[services/]
    C11a --> C11a3[types/]

    C12 --> C12a[src/lib/]

    C12a --> C12a1[components/]
    C12a --> C12a2[forms/]
    C12a --> C12a3[grids/]
    C12a --> C12a4[services/]

    C2 --> C21[rest-sdk/]
    C2 --> C22[rest-sdk-angular/]

    C3 --> C31[prisma-rest-generator/]

````

Key relationships:
1. Backend feature modules (`libs/feature/{feature-name}`) contain the business logic and Prisma schema
2. Frontend feature modules (`libs/feature/{feature-name}-afat`) contain Angular components and services
3. SDK modules (`libs/sdk/`) are auto-generated from backend controllers
4. The client app (`apps/client/`) consumes frontend feature modules and SDKs
5. The server app (`apps/server/`) consumes backend feature modules
6. Generator modules (`libs/generator/`) provide code generation capabilities -->

### 4. Creating a New Feature Module

#### 4.1. Backend Module Creation

1. Create the backend module directory:

   ```bash
   mkdir -p libs/feature/{feature-name}/src/{lib,prisma,migrations,i18n}
````

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

<!-- !!TODO!!: Explain the purpose of each Prisma generator and when to modify the configuration -->
<!-- Filled: Prisma generator explanations:
1. `client` generator: Creates the Prisma Client for database operations
   - `provider`: Specifies the Prisma Client generator
   - `output`: Defines where the generated client code will be placed
   - `engineType`: Sets the engine type (dataproxy for better performance)
   - `previewFeatures`: Enables preview features specific to your module

2. `nestjs` generator: Creates NestJS-specific code from the Prisma schema
   - `provider`: Specifies the NestJS-mod Prisma generator
   - `output`: Defines where the generated NestJS code will be placed
   - `controllerOutputPath`: Specifies where generated controllers will be created
   - `controllerBusinessLogic`: Enables generation of business logic in controllers
   - `generateControllers`: Controls whether controllers are generated

Modify these configurations when:
- Adding new database features or changing the database structure
- Changing the output directory structure
- Enabling/disabling controller generation
- Adding new preview features -->

#### 4.2. Backend Controllers

1. Create controller files in [`libs/feature/{feature-name}/src/lib/controllers/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}/src/lib/controllers/)

2. Follow the pattern from existing controllers like:

   - [metrics-github-user.controller.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics/src/lib/controllers/metrics-github-user.controller.ts)
   - [sso-users.controller.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/sso/src/lib/controllers/sso-users.controller.ts)

3. Key controller patterns:
   - Use proper decorators for authentication/authorization
   - Implement CRUD operations (findMany, findOne, createOne, updateOne, deleteOne)
   - Use DTOs for input validation
   - Handle tenant isolation for multi-tenant applications

<!-- !!TODO!!: Provide examples of common controller patterns and when to use each one -->
<!-- Filled: Common controller patterns:
1. CRUD Controller Pattern: Implements all basic CRUD operations for an entity
   - Use when you need full management of an entity
   - Example: User management, settings configuration

2. Read-Only Controller Pattern: Implements only read operations (findMany, findOne)
   - Use for entities that should not be modified through the API
   - Example: Reports, analytics data

3. Write-Only Controller Pattern: Implements only create/update/delete operations
   - Use for data collection or processing endpoints
   - Example: Logging, data import endpoints

4. Specialized Controller Pattern: Implements custom business logic operations
   - Use for complex workflows or specialized functionality
   - Example: Authentication endpoints, data synchronization

When to use each pattern:
- CRUD: Default choice for most entities
- Read-Only: For reporting or analytics data
- Write-Only: For data collection endpoints
- Specialized: For complex business workflows -->

#### 4.3. DTOs and Types

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

<!-- !!TODO!!: Explain the difference between various DTO types and when to use each one -->
<!-- Filled: DTO types and their usage:
1. Create DTOs (CreateEntityDto): Used for creating new entities
   - Include all required fields for entity creation
   - May include optional fields with default values
   - Example: CreateMetricsSettingsDto

2. Update DTOs (UpdateEntityDto): Used for updating existing entities
   - All fields are optional to allow partial updates
   - Use conditional field assignment pattern
   - Example: UpdateMetricsSettingsDto

3. Response DTOs (EntityDto): Used for returning entity data
   - Include all fields that should be exposed in API responses
   - May exclude sensitive or internal fields
   - Example: MetricsSettingsDto

4. Filter DTOs (FindManyArgs): Used for querying multiple entities
   - Include pagination, search, and sorting parameters
   - May include relational filter fields
   - Example: FindManyMetricsArgs

5. Specialized DTOs: Used for specific operations or workflows
   - Custom data structures for complex operations
   - Example: Authentication requests, file uploads -->

### 5. Frontend Module Creation

#### 5.1. Frontend Module Structure

1. Create the frontend module directory:

   ```bash
   mkdir -p libs/feature/{feature-name}-afat/src/{lib,components,forms,grids,services,i18n}
   ```

2. Copy basic structure from an existing frontend module like metrics-afat:
   - [`libs/feature/metrics-afat/src/lib/components/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/components/)
   - [`libs/feature/metrics-afat/src/lib/forms/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/forms/)
   - [`libs/feature/metrics-afat/src/lib/grids/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/grids/)
   - [`libs/feature/metrics-afat/src/lib/services/`](https://github.com/site15/site15.ru/tree/master/libs/feature/metrics-afat/src/lib/services/)

<!-- !!TODO!!: Explain the purpose of each directory in the frontend module structure -->
<!-- Filled: Frontend module directory purposes:
1. `components/`: Contains reusable UI components that don't fit into forms or grids
   - Custom widgets, cards, panels
   - Shared components used across multiple parts of the feature

2. `forms/`: Contains form components for creating and updating entities
   - Create and edit forms with validation
   - Modal forms that can be embedded in grids

3. `grids/`: Contains grid/table components for displaying lists of entities
   - Data tables with pagination, search, and sorting
   - Support for view mode and relational filtering

4. `services/`: Contains service classes for API communication and data handling
   - API service for REST calls
   - Mapper service for data transformation
   - Form service for form configuration

5. `i18n/`: Contains internationalization files for translations
   - PO files for different languages
   - JSON files for runtime translation loading -->

#### 5.2. Grid Components

1. Create grid components in [`libs/feature/{feature-name}-afat/src/lib/grids/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}-afat/src/lib/grids/)

2. Follow the pattern from existing grid components:

   - [metrics-github-user-grid.component.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/grids/metrics-github-user-grid/metrics-github-user-grid.component.ts)

3. Key grid component patterns:
   - Implement `OnInit` and `OnChanges` lifecycle hooks
   - Use BehaviorSubject for state management
   - Implement search, pagination, and sorting
   - Support view mode for embedding in other components
   - Pass relational inputs as @Input() properties

<!-- !!TODO!!: Provide a detailed example of a grid component implementation with explanations -->
<!-- Filled: Grid component implementation example:
```typescript
@Component({
  // Import all necessary Angular and NgZorro modules
  imports: [
    NzTableModule,
    NzButtonModule,
    // ... other imports
  ],
  selector: 'feature-entity-grid',
  templateUrl: './feature-entity-grid.component.html',
  standalone: true,
})
export class FeatureEntityGridComponent implements OnInit, OnChanges {
  // Input for view mode (when embedded in other components)
  @Input() viewMode = false;

  // Input for relational filtering
  @Input() relatedEntityId?: string;

  // BehaviorSubjects for reactive data management
  items$ = new BehaviorSubject<EntityModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);

  // Form controls for search functionality
  searchField = new FormControl('');

  constructor(
    private readonly entityService: EntityService,
    private readonly nzModalService: NzModalService,
  ) {}

  ngOnInit(): void {
    // Setup reactive search with debounce
    this.searchField.valueChanges
      .pipe(debounceTime(700), distinctUntilChanged())
      .subscribe(() => this.loadMany({ force: true }));

    // Initial data load
    this.loadMany();
  }

  ngOnChanges(): void {
    // Reload data when inputs change
    this.loadMany({ force: true });
  }

  loadMany(args?: { force?: boolean }) {
    // Implementation for loading data with filters and pagination
    this.entityService.findMany({ /* parameters */ })
      .pipe(tap(result => {
        this.items$.next(result.entities);
        this.meta$.next(result.meta);
      }))
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    // Show modal form for creating or updating entities
    if (this.viewMode) return; // Don't show in view mode

    const modal = this.nzModalService.create({
      nzTitle: id ? 'Update Entity' : 'Create Entity',
      nzContent: EntityFormComponent,
      nzData: { id, relatedEntityId: this.relatedEntityId }
    });
  }
}
```

Key implementation details:
1. Use `BehaviorSubject` for reactive state management
2. Implement search with `debounceTime` to reduce API calls
3. Support view mode for embedding in other components
4. Handle relational inputs as `@Input()` properties
5. Use proper lifecycle hooks for data loading -->

#### 5.3. Services

1. Create service files in [`libs/feature/{feature-name}-afat/src/lib/services/`](https://github.com/site15/site15.ru/tree/master/libs/feature/{feature-name}-afat/src/lib/services/)

2. Follow the pattern from existing services:

   - [metrics-github-user.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user.service.ts)
   - [metrics-github-user-mapper.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user-mapper.service.ts)
   - [metrics-github-user-form.service.ts](https://github.com/site15/site15.ru/blob/master/libs/feature/metrics-afat/src/lib/services/metrics-github-user-form.service.ts)

3. Key service patterns:
   - API services wrap REST calls and handle data transformation
   - Mapper services convert between API interfaces and model objects
   - Form services configure Formly fields with validation

<!-- !!TODO!!: Explain the responsibility of each service type and how they work together -->
<!-- Filled: Service types and responsibilities:
1. API Service (EntityService): Handles HTTP communication with backend
   - Wraps REST API calls (GET, POST, PUT, DELETE)
   - Handles error responses and HTTP status codes
   - Returns observables for reactive programming
   - Example: MetricsUserService

2. Mapper Service (EntityMapperService): Converts between API and model objects
   - Transforms API response data to frontend model objects
   - Converts model objects to API request format
   - Handles date formatting and data validation
   - Example: MetricsUserMapperService

3. Form Service (EntityFormService): Configures form fields and validation
   - Defines Formly field configurations
   - Sets up validation rules and error messages
   - Provides form layouts and grouping
   - Example: MetricsUserFormService

How they work together:
1. API Service makes the HTTP call and receives raw API data
2. Mapper Service transforms the API data into model objects
3. Components use model objects for display and user interaction
4. Form Service provides configuration for creating/editing forms
5. When saving, components convert model objects back to API format through Mapper Service
6. API Service sends the data to the backend -->

### 6. Code Generation

#### 6.1. Backend Code Generation

1. Generate backend code:

   ```bash
   npm run generate -- --project=server
   ```

2. Update generated code with business logic and specific implementations

<!-- !!TODO!!: Explain the backend code generation process in more detail -->

#### 6.2. Frontend Code Generation

1. Generate frontend code:

   ```bash
   npm run generate -- --project=client
   ```

2. Update generated code with business logic and specific implementations

<!-- !!TODO!!: Explain the frontend code generation process in more detail -->

### 7. Integration Steps

#### 7.1. Module Registration

1. Register your backend module in the main server application:

   - Update [`apps/server/src/main.ts`](https://github.com/site15/site15.ru/blob/master/apps/server/src/main.ts)

2. Register your frontend module:
   - Update [`apps/client/src/app/app.config.ts`](https://github.com/site15/site15.ru/blob/master/apps/client/src/app/app.config.ts)

<!-- !!TODO!!: Provide step-by-step instructions for module registration with code examples -->
<!-- Filled: Module registration steps:

**Backend Module Registration:**
1. Add your module to the FEATURE_MODULE_IMPORTS array in `apps/server/src/feature.module.ts`:
   ```typescript
   export const FEATURE_MODULE_IMPORTS = [
     // ... existing modules
     YourFeatureModule.forRoot(),
   ];
   ```

2. Ensure your module exports the necessary components in `libs/feature/{feature-name}/src/lib/{feature-name}.module.ts`:
   ```typescript
   export const { YourFeatureModule } = createNestModule({
     moduleName: 'YourFeatureModule',
     imports: [
       // Required imports
     ],
     providers: [
       // Service providers
     ],
     controllers: [
       // Controllers
     ],
     exports: [
       // Export services that other modules might need
     ]
   });
   ```

**Frontend Module Registration:**
1. Add your module's REST SDK to the imports in `apps/client/src/app/app.config.ts`:
   ```typescript
   importProvidersFrom(
     // ... existing modules
     YourFeatureRestSdkAngularModule.forRoot({
       basePath: serverUrl,
     }),
   )
   ```

2. If your module has Formly fields, add them to the FormlyModule configuration:
   ```typescript
   FormlyModule.forRoot({
     types: [
       // ... existing fields
       ...YOUR_FEATURE_FORMLY_FIELDS,
     ],
   })
   ```

3. Import and register any additional services or components in your feature's index.ts file -->

#### 7.2. SDK Generation

1. After creating your backend controllers, generate the SDK:

   ```bash
   npm run generate -- --project=server
   ```

2. Update frontend services to use the new API methods:
   - Pass all filter parameters in the correct order
   - Handle new DTO types

<!-- !!TODO!!: Explain what the SDK generation process does and how to verify it worked correctly -->
<!-- Filled: SDK generation process:

The SDK generation process automatically creates client-side code based on your backend controllers:

1. **What it does:**
   - Generates TypeScript interfaces for all DTOs
   - Creates service classes with methods matching your controller endpoints
   - Produces Angular services for easy integration
   - Generates OpenAPI/Swagger documentation

2. **Generated files:**
   - `libs/sdk/rest-sdk/src/lib/generated/` - Core SDK interfaces and services
   - `libs/sdk/rest-sdk-angular/src/lib/generated/` - Angular-specific services
   - `swagger.json` - OpenAPI specification file

3. **How to verify it worked:**
   - Check that new files were created in the generated directories
   - Verify that your controller methods appear in the generated services
   - Look for your DTOs in the generated interface files
   - Check the swagger.json file to ensure your endpoints are documented
   - Run `npm run build` to ensure there are no compilation errors

4. **Common issues:**
   - Missing `@Api` decorators in controllers
   - Incorrect DTO definitions
   - Circular dependencies in your module structure -->

#### 7.3. Database Migration

1. Create database migrations:

   ```bash
   npm run pg-flyway:create:{feature-name} --args=InitialSetup
   ```

2. Apply migrations:
   ```bash
   npm run pg-flyway:migrate:{feature-name}
   ```

<!-- !!TODO!!: Explain the database migration process in more detail and common issues that might occur -->
<!-- Filled: Database migration process:

**Migration Creation:**
1. Run the create command with a descriptive name:
   ```bash
   npm run pg-flyway:create:{feature-name} --args=AddUserTable
   ```

2. This creates a new SQL file in `libs/feature/{feature-name}/src/migrations/`

3. Edit the generated SQL file to define your database changes:
   ```sql
   -- Create table
   CREATE TABLE "user" (
     "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     "name" VARCHAR(255) NOT NULL,
     "email" VARCHAR(255) UNIQUE NOT NULL,
     "created_at" TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes
   CREATE INDEX "idx_user_email" ON "user" ("email");
   ```

**Migration Application:**
1. Run the migrate command to apply all pending migrations:
   ```bash
   npm run pg-flyway:migrate:{feature-name}
   ```

2. This applies all unapplied migrations in chronological order

**Common Issues:**
1. **Migration conflicts:** When multiple developers create migrations simultaneously
   - Solution: Coordinate with team members, merge carefully

2. **SQL syntax errors:** Incorrect SQL in migration files
   - Solution: Test SQL locally first, use database documentation

3. **Rollback issues:** Difficulty reverting migrations
   - Solution: Write proper rollback scripts, test migrations thoroughly

4. **Performance issues:** Large data migrations affecting production
   - Solution: Schedule large migrations during maintenance windows

5. **Cross-module dependencies:** Migrations depending on other modules
   - Solution: Carefully order module migrations, use feature-specific migrations -->

### 8. Best Practices

#### 8.1. Backend Best Practices

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

<!-- !!TODO!!: Provide examples of good and bad DTO design patterns -->
<!-- Filled: DTO design patterns:

**Good DTO Design:**

1. **Clear Separation of Concerns:**
   ```typescript
   // Good: Separate DTOs for different operations
   export class CreateUserDto {
     @IsString()
     @IsNotEmpty()
     name: string;

     @IsEmail()
     email: string;

     @IsString()
     @MinLength(8)
     password: string;
   }

   export class UpdateUserDto {
     @IsString()
     @IsOptional()
     name?: string;

     @IsEmail()
     @IsOptional()
     email?: string;
   }
   ```

2. **Proper Validation:**
   ```typescript
   // Good: Specific validation for each field
   export class CreateProductDto {
     @IsString()
     @Length(1, 100)
     name: string;

     @IsNumber()
     @Min(0)
     price: number;

     @IsEnum(ProductCategory)
     category: ProductCategory;
   }
   ```

3. **Extensibility:**
   ```typescript
   // Good: Base DTO that can be extended
   export class BaseUserDto {
     @IsString()
     name: string;
   }

   export class CreateUserDto extends BaseUserDto {
     @IsEmail()
     email: string;
   }
   ```

**Bad DTO Design:**

1. **Overly Complex DTOs:**
   ```typescript
   // Bad: One DTO trying to do everything
   export class UserDto {
     @IsString()
     @IsOptional() // Used for both create and update
     name?: string;

     @IsEmail()
     @IsOptional() // Not all operations need email
     email?: string;

     @IsString()
     @IsOptional() // Sensitive data that shouldn't be exposed
     password?: string;
   }
   ```

2. **Missing Validation:**
   ```typescript
   // Bad: No validation at all
   export class CreateProductDto {
     name: string;
     price: number;
   }
   ```

3. **Inconsistent Naming:**
   ```typescript
   // Bad: Inconsistent field naming
   export class CreateUserDto {
     userName: string;  // camelCase
     user_email: string; // snake_case
     UserAge: number;   // PascalCase
   }
   ```

**Best Practices:**
1. Create separate DTOs for create, update, and response operations
2. Use validation decorators for all input fields
3. Keep DTOs focused on specific use cases
4. Use consistent naming conventions
5. Document complex DTOs with comments
6. Avoid exposing sensitive internal fields -->

#### 8.2. Frontend Best Practices

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

<!-- !!TODO!!: Add more specific frontend best practices with code examples -->
<!-- Filled: Additional frontend best practices:

1. **Component Communication:**
   ```typescript
   // Good: Use @Input() and @Output() for parent-child communication
   @Component({
     selector: 'child-component'
   })
   export class ChildComponent {
     @Input() data: DataType;
     @Output() dataChange = new EventEmitter<DataType>();

     onDataChange(newData: DataType) {
       this.dataChange.emit(newData);
     }
   }
   ```

2. **State Management:**
   ```typescript
   // Good: Use BehaviorSubject for component state
   export class MyComponent {
     private dataSubject = new BehaviorSubject<DataModel[]>([]);
     public data$ = this.dataSubject.asObservable();

     updateData(newData: DataModel[]) {
       this.dataSubject.next(newData);
     }
   }
   ```

3. **Error Handling:**
   ```typescript
   // Good: Proper error handling with user feedback
   this.myService.getData().pipe(
     catchError(error => {
       this.notificationService.error('Failed to load data', error.message);
       return of([]); // Return default value
     })
   ).subscribe(data => {
     this.data = data;
   });
   ```

4. **Performance Optimization:**
   ```typescript
   // Good: Use OnPush change detection strategy
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   export class OptimizedComponent {
     // Component logic
   }
   ```

5. **Memory Management:**
   ```typescript
   // Good: Unsubscribe from observables to prevent memory leaks
   @UntilDestroy()
   @Component({})
   export class MyComponent implements OnInit, OnDestroy {
     ngOnInit() {
       this.dataService.getData().pipe(
         untilDestroyed(this)
       ).subscribe(data => {
         // Handle data
       });
     }
   }
   ```

6. **Accessibility:**
   ```html
   <!-- Good: Proper ARIA attributes and semantic HTML -->

<button
aria-label="Delete item"
(click)="deleteItem()">
<i aria-hidden="true" class="delete-icon"></i>
</button>

````

7. **Internationalization:**
```typescript
// Good: Use translation keys for all user-facing text
constructor(private translocoService: TranslocoService) {}

getTranslatedText() {
  return this.translocoService.translate('feature.component.title');
}
``` -->

### 9. Documentation and Testing

1. **Documentation:**

- Update [QODER_RULES.md](https://github.com/site15/site15.ru/blob/master/QODER_RULES.md) with any new patterns
- Update [QODER_RULES_BY_CODE.md](https://github.com/site15/site15.ru/blob/master/QODER_RULES_BY_CODE.md) with code examples
- Add README files for new modules

2. **Testing:**
- Write unit tests for services and components
- Write integration tests for complex workflows
- Test edge cases and error conditions

<!-- !!TODO!!: Provide specific guidance on what to document and how to write effective tests -->
<!-- Filled: Documentation and testing guidance:

**Documentation:**

1. **Module README Files:**
````

```

2. **Code Comments:**
```

```

3. **QODER Rules Updates:**
- Add new patterns to QODER_RULES.md under appropriate sections
- Include code examples in QODER_RULES_BY_CODE.md
- Document any deviations from established patterns

**Testing:**

1. **Unit Tests Structure:**
```

```

2. **Integration Tests:**
```

````

3. **Test Coverage:**
- Aim for >80% code coverage
- Test happy paths and error conditions
- Test edge cases and boundary conditions
- Use realistic test data
- Mock external dependencies -->

### 10. Deployment

1. **Build Process:**

```bash
npm run build:prod
````

2. **Deployment:**
   - Update environment configurations
   - Run database migrations
   - Deploy applications

<!-- !!TODO!!: Add more detailed deployment instructions for different environments (dev, staging, production) -->
<!-- Filled: Detailed deployment instructions:

**Development Deployment:**
1. Ensure all environment variables are set in `.env` file
2. Run database migrations:
   ```bash
   npm run pg-flyway:migrate
   ```
3. Build the application:
   ```bash
   npm run build:prod
   ```
4. Start the application:
   ```bash
   npm run pm2:start
   ```

**Staging Deployment:**
1. Update staging-specific environment variables
2. Run migrations on staging database:
   ```bash
   npm run pg-flyway:migrate --env=staging
   ```
3. Build with staging configuration:
   ```bash
   npm run build:staging
   ```
4. Deploy to staging environment using CI/CD pipeline

**Production Deployment:**
1. Review and update production environment variables
2. Create database backup before migration
3. Run migrations on production database:
   ```bash
   npm run pg-flyway:migrate --env=production
   ```
4. Build with production configuration:
   ```bash
   npm run build:prod
   ```
5. Deploy using blue-green deployment or similar zero-downtime strategy
6. Monitor application health and performance
7. Rollback plan if issues occur

**Environment Configuration:**
- Development: Local development environment
- Staging: Pre-production testing environment
- Production: Live user-facing environment

Each environment should have:
- Separate database instances
- Different API endpoints
- Unique environment variables
- Distinct logging and monitoring configurations -->

This guide provides a comprehensive framework for creating new projects based on the existing architecture. Follow the patterns established in the metrics and sso modules to maintain consistency across the codebase.

<!-- !!TODO!!: Add a checklist summarizing all the steps needed to create a new feature module -->
<!-- Filled: Feature Module Creation Checklist:

□ 1. **Planning Phase**
  □ Define business requirements and core entities
  □ Identify key features and user workflows
  □ Plan database schema design
  □ Determine API endpoints needed

□ 2. **Backend Development**
  □ Create module directory structure
  □ Copy and customize module files from existing feature
  □ Define Prisma schema and generate client
  □ Implement controllers with CRUD operations
  □ Create DTOs for API contracts
  □ Implement service layers and business logic
  □ Add proper error handling and validation
  □ Write unit tests for backend components

□ 3. **Frontend Development**
  □ Create frontend module directory structure
  □ Copy and customize frontend components
  □ Implement grid components for data display
  □ Create form components for data entry
  □ Develop service layers for API communication
  □ Add internationalization support
  □ Write unit tests for frontend components

□ 4. **Integration**
  □ Register backend module in main application
  □ Register frontend module in client application
  □ Generate and verify SDK integration
  □ Create and apply database migrations
  □ Test API endpoints and data flow

□ 5. **Testing & Documentation**
  □ Run full test suite (unit, integration, E2E)
  □ Update documentation files
  □ Add examples and usage instructions
  □ Verify code quality and linting

□ 6. **Deployment**
  □ Build production artifacts
  □ Deploy to staging environment
  □ Perform staging validation
  □ Deploy to production
  □ Monitor application performance -->
