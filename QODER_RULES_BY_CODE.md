# QODER Rules by Code Analysis

This document contains development patterns and rules extracted from actual code implementations in the project. These rules should be used by Qoder to maintain consistency and follow established patterns.

> **Note**: For proper code block formatting in documentation, refer to the [Correct Code Insertions Pattern](./docs/patterns/correct-code-insertions.md)

## Backend Development Patterns

### 1. Controller Patterns

#### 1.1. CRUD Controllers

- All CRUD controllers must extend basic operations (findMany, findOne, createOne, updateOne, deleteOne)
- Use `@nestjs/common` decorators for HTTP methods
- Use `@nestjs/swagger` for API documentation
- Implement proper error handling with `@nestjs-mod/validation`
- Use Prisma client for database operations

**Example Controller Structure:**

```typescript
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectPrismaClient, PrismaClient } from '@nestjs-mod/prisma';
import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';

@ApiBadRequestResponse({
  schema: { allOf: refs(CustomError, ValidationError) },
})
@ApiTags('FeatureName')
@Controller('/feature/name')
export class FeatureNameController {
  constructor(
    @InjectPrismaClient('feature')
    private readonly prismaClient: PrismaClient,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyResponseDto })
  async findMany(@Query() args: FindManyArgsDto) {
    // Implementation
  }

  @Post()
  @ApiCreatedResponse({ type: EntityDto })
  async createOne(@Body() args: CreateEntityDto) {
    // Implementation
  }

  @Put(':id')
  @ApiOkResponse({ type: EntityDto })
  async updateOne(@Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateEntityDto) {
    // Implementation
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(@Param('id', new ParseUUIDPipe()) id: string, @InjectTranslateFunction() getText: TranslateFunction) {
    // Implementation
  }

  @Get(':id')
  @ApiOkResponse({ type: EntityDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    // Implementation
  }
}
```

#### 1.2. Field Handling in Controllers

- **Explicit Field Listing**: Controllers must explicitly list fields during insertion and updating instead of using destructuring
- **Skip Relational Fields**: Fields for relational connections should be skipped in the main field listing
- **Conditional Field Assignment**: Use pattern `...(args.fieldName !== undefined ? { fieldName: args.fieldName } : {})` for optional fields
- **Relational Filter Handling**: Controllers must create specific DTOs for handling relational filters in findMany operations
- **Filter Parameter Usage**: Use `...(args.filterName ? { filterName: { equals: args.filterName } } : {})` pattern for conditional filter application

**Example of Explicit Field Listing:**

```typescript
// Correct approach - explicit field listing
return await this.prismaClient.entity.create({
  data: {
    field1: args.field1,
    field2: args.field2,
    ...(args.optionalField !== undefined ? { optionalField: args.optionalField } : {}),
    // Relational fields handled separately
    RelatedEntity: { connect: { id: args.relatedEntityId } },
  },
});

// Incorrect approach - using destructuring
return await this.prismaClient.entity.create({
  data: {
    ...args, // Don't do this
    RelatedEntity: { connect: { id: args.relatedEntityId } },
  },
});
```

**Example of Relational Filter Handling:**

```typescript
// Create specific DTO for relational filters
export class FindManyEntityWithRelationArgs extends FindManyArgs {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;
}

// Use in controller with proper filter application
async findMany(@Query() args: FindManyEntityWithRelationArgs) {
  return await this.prismaClient.$transaction(async (prisma) => {
    return {
      entities: await prisma.entity.findMany({
        where: {
          // Other conditions
          ...(args.relatedEntityId
            ? { RelatedEntity: { id: { equals: args.relatedEntityId } } }
            : {}),
        },
      }),
      totalResults: await prisma.entity.count({
        where: {
          // Same conditions as above
          ...(args.relatedEntityId
            ? { RelatedEntity: { id: { equals: args.relatedEntityId } } }
            : {}),
        },
      }),
    };
  });
}
```

#### 1.3. User Context Handling

- Always inject user context using custom decorators
- Handle tenant isolation using external tenant ID decorators
- Connect current user as creator/updater using relation-specific field names

**Example of User Context Handling:**

```typescript
@Post()
@ApiCreatedResponse({ type: EntityDto })
async createOne(
  @CurrentExternalTenantId() externalTenantId: string,
  @CurrentUser() user: User,
  @Body() args: CreateEntityDto,

) {
  return await this.prismaClient.entity.create({
    data: {
      // Entity fields
      name: args.name,
      description: args.description,

      // User connections
      User_Entity_createdByToUser: { connect: { id: user.id } },
      User_Entity_updatedByToUser: { connect: { id: user.id } },

      // Tenant handling
      ...(user.userRole === UserRole.Admin
        ? { tenantId: externalTenantId }
        : {
            tenantId: user?.userRole === UserRole.User ? user.tenantId : externalTenantId,
          }),
    },
  });
}
```

#### 1.4. Role-Based Access Control

- Use custom decorators for role validation
- Implement tenant-based filtering in queries based on user role
- Admin users can access all tenants, regular users only their own tenant

**Example of Role-Based Access Control:**

```typescript
@CheckRole([UserRole.User, UserRole.Admin])
@Controller('/feature/name')
export class FeatureNameController {
  // Controller implementation

  async findMany(
    @CurrentExternalTenantId() externalTenantId: string,
    @CurrentUser() user: User,
    @Query() args: FindManyArgs,
  ) {
    return await this.prismaClient.$transaction(async (prisma) => {
      return {
        entities: await prisma.entity.findMany({
          where: {
            // Search conditions
            ...(args.searchText
              ? {
                  OR: [
                    { name: { contains: args.searchText, mode: 'insensitive' } },
                    { description: { contains: args.searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),

            // Tenant filtering based on role
            ...(user.userRole === UserRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: user?.userRole === UserRole.User ? user.tenantId : externalTenantId,
                }),
          },
          // Pagination and sorting
        }),
        totalResults: await prisma.entity.count({
          where: {
            // Same conditions as above
          },
        }),
      };
    });
  }
}
```

#### 1.5. Data Validation

- Use DTOs for input validation with `class-validator` decorators
- Extend generated DTOs for additional validation requirements
- Use `ApiProperty` decorators for Swagger documentation

**Example of DTO Validation:**

```typescript
// Base DTO (generated)
export class CreateEntityDto {
  name: string;
  description?: string | null;
}

// Extended DTO with validation
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullEntityDto extends CreateEntityDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  relatedEntityId!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### 2. Service Patterns

#### 2.1. CRUD Services

- CRUD services must implement basic operations (create, findMany, findOne, update, delete)
- Inject Prisma client using feature-specific injection tokens
- Use transactions for operations requiring atomicity
- Implement proper error handling and type conversion

**Example CRUD Service:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPrismaClient, PrismaClient } from '@nestjs-mod/prisma';

@Injectable()
export class EntityService {
  constructor(
    @InjectPrismaClient('feature')
    private readonly prismaClient: PrismaClient,
  ) {}

  async create(data: CreateEntityInput) {
    return await this.prismaClient.$transaction(async (prisma) => {
      // Perform multiple related operations atomically
      const entity = await prisma.entity.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Additional operations related to entity creation
      await prisma.entityLog.create({
        data: {
          entityId: entity.id,
          action: 'CREATE',
          timestamp: new Date(),
        },
      });

      return entity;
    });
  }

  async findMany(args: FindManyArgs) {
    return await this.prismaClient.entity.findMany({
      where: args.where,
      take: args.take,
      skip: args.skip,
      orderBy: args.orderBy,
    });
  }

  async findOne(id: string) {
    return await this.prismaClient.entity.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateEntityInput) {
    return await this.prismaClient.entity.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return await this.prismaClient.entity.delete({
      where: { id },
    });
  }
}
```

#### 2.2. Services with Additional Methods

- Services may contain additional methods for business logic, such as authentication, activation, etc.
- Additional methods should follow the same error handling and transaction principles
- Use separate methods for complex business operations

**Example Service with Additional Methods:**

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async signIn(credentials: SignInCredentials) {
    const user = await this.userService.findByEmail(credentials.email);
    if (!user || !this.validatePassword(credentials.password, user.password)) {
      throw new AuthError(AuthErrorEnum.WrongPassword);
    }
    return await this.tokenService.generateTokens(user);
  }

  async signUp(userData: SignUpData) {
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError(AuthErrorEnum.UserIsExists);
    }
    const user = await this.userService.create(userData);
    await this.sendActivationEmail(user);
    return user;
  }

  async activate(activationData: ActivationData) {
    const user = await this.userService.findByActivationCode(activationData.code);
    if (!user) {
      throw new AuthError(AuthErrorEnum.ActivateEmailWrongCode);
    }
    return await this.userService.activate(user.id);
  }
}
```

#### 2.3. Query Patterns

- Implement search functionality with OR conditions for multiple fields
- Use pagination with take/skip parameters
- Implement sorting with dynamic field validation
- Apply tenant filtering based on user role

**Example Query Patterns:**

``typescript
async findMany(args: {
searchText?: string;
tenantId?: string;
curPage?: number;
perPage?: number;
sort?: string;
}) {
const { take, skip } = this.prismaToolsService.getFirstSkipFromCurPerPage({
curPage: args.curPage,
perPage: args.perPage,
});

const orderBy = (args.sort || 'createdAt:desc')
.split(',')
.map((s) => s.split(':'))
.reduce(
(all, [key, value]) => ({
...all,
...(key in Prisma.EntityScalarFieldEnum
? {
[key]: value === 'desc' ? 'desc' : 'asc',
}
: {}),
}),
{},
);

return await this.prismaClient.$transaction(async (prisma) => {
return {
entities: await prisma.entity.findMany({
where: {
...(args.searchText
? {
OR: [
{ name: { contains: args.searchText, mode: 'insensitive' } },
{ description: { contains: args.searchText, mode: 'insensitive' } },
],
}
: {}),
...(args.tenantId ? { tenantId: args.tenantId } : {}),
},
take,
skip,
orderBy,
}),
totalResults: await prisma.entity.count({
where: {
// Same conditions as above
},
},
});
});
}

````

### 3. DTO Patterns

#### 3.1. Creation DTOs

- Extend base DTOs generated by Prisma
- Add validation decorators for required fields
- Use `CreateFull` prefix for DTOs including relational fields
- Do not include `externalUserId` in extended creation DTOs

**Example Creation DTO:**

```typescript
// Base DTO (generated by Prisma)
export class CreateEntityDto {
  name: string;
  description?: string | null;
}

// Extended DTO with validation
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullEntityDto extends CreateEntityDto {
  @ApiProperty({
    type: 'string',
    description: 'ID of related entity',
  })
  @IsNotEmpty()
  @IsString()
  relatedEntityId!: string;

  @ApiProperty({
    type: 'string',
    description: 'Optional field',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
````

#### 3.2. Update DTOs

- Extend base update DTOs generated by Prisma
- Make all fields optional to support partial updates
- Use `PartialType` pattern for update operations

**Example Update DTO:**

```typescript
// Base DTO (generated by Prisma)
export class UpdateEntityDto {
  name?: string | null;
  description?: string | null;
}

// Extended DTO with additional validation if needed
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFullEntityDto extends UpdateEntityDto {
  @ApiProperty({
    type: 'string',
    description: 'Optional field for update',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### 4. Module Patterns

#### 4.1. Simple Module Structure

- Use `createNestModule` function to create modules
- Define proper module categories (feature, infrastructure, etc.)
- Implement environment configuration with proper naming conventions
- Use feature-specific context names for Prisma and other services

**Example Simple Module Structure:**

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { FEATURE_NAME, FEATURE_MODULE } from './feature.constants';
import { FeatureController } from './controllers/feature.controller';
import { FeatureService } from './services/feature.service';

export const { FeatureModule } = createNestModule({
  moduleName: FEATURE_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: FeatureStaticEnvironments,
  imports: [
    PrismaModule.forFeature({
      contextName: FEATURE_NAME,
      featureModuleName: FEATURE_NAME,
    }),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
});
```

#### 4.2. Extended Module Structure

- Extended module structure allows dynamic creation of controllers or services
- Use this structure when conditional component creation is needed
- Apply guards and filters conditionally based on environment settings

**Example Extended Module Structure:**

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { FEATURE_NAME, FEATURE_MODULE } from './feature.constants';
import { FeatureController } from './controllers/feature.controller';
import { FeatureService } from './services/feature.service';

export const { FeatureModule } = createNestModule({
  moduleName: FEATURE_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: FeatureStaticEnvironments,
  imports: [
    PrismaModule.forFeature({
      contextName: FEATURE_NAME,
      featureModuleName: FEATURE_NAME,
    }),
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: FEATURE_NAME,
      featureModuleName: FEATURE_NAME,
    }),
  ],
  controllers: (asyncModuleOptions) =>
    [FeatureController].map((ctrl) => {
      if (asyncModuleOptions.staticEnvironments?.useGuards) {
        UseGuards(FeatureGuard)(ctrl);
      }
      return ctrl;
    }),
  providers: (asyncModuleOptions) => [
    FeatureService,
    ...(asyncModuleOptions.staticEnvironments.useFilters
      ? [{ provide: APP_FILTER, useClass: FeatureExceptionsFilter }]
      : []),
  ],
  sharedProviders: [FeatureCacheService],
});
```

## Frontend Development Patterns

### 1. Component Patterns

#### 1.1. Standalone Components

- Use Angular standalone components with explicit imports
- Implement `ChangeDetectionStrategy.OnPush` for better performance
- Use `@UntilDestroy()` decorator for automatic subscription cleanup

**Example Standalone Component:**

```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';

@UntilDestroy()
@Component({
  imports: [FormlyModule, NzFormModule, NzButtonModule, FormsModule, ReactiveFormsModule],
  selector: 'feature-form',
  templateUrl: './feature-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FeatureFormComponent implements OnInit {
  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    private readonly featureService: FeatureService,
    private readonly featureFormService: FeatureFormService,
  ) {}

  ngOnInit(): void {
    // Component initialization
  }
}
```

#### 1.2. Form Components

#### 1.2.1. CRUD Forms

- Implement reactive forms with `UntypedFormGroup`
- Use Formly for dynamic form configuration
- Handle form submission with proper error handling
- Implement create/update logic based on ID presence

**Example CRUD Form:**

```typescript
@Component({
  // ... component configuration
})
export class FeatureFormComponent implements OnInit {
  @Input() id?: string;
  @Input() relatedEntityId?: string;
  @Output() afterCreate = new EventEmitter<EntityModel>();
  @Output() afterUpdate = new EventEmitter<EntityModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    private readonly featureService: FeatureService,
    private readonly featureFormService: FeatureFormService,
    private readonly validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    this.featureFormService.init().then(() => {
      if (this.id) {
        this.findOne().pipe(untilDestroyed(this)).subscribe();
      } else {
        this.setFieldsAndModel();
      }
    });
  }

  submitForm(): void {
    if (this.id) {
      this.updateOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.afterUpdate.next(result);
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      this.createOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.afterCreate.next(result);
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  private createOne() {
    return this.featureService
      .createOne({
        ...this.featureMapperService.toJson(this.form.value),
        relatedEntityId: this.relatedEntityId,
      })
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }

  private updateOne() {
    if (!this.id) {
      return throwError(() => new Error('ID not set'));
    }
    return this.featureService
      .updateOne(this.id, this.featureMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }
}
```

#### 1.2.2. Forms with Additional Methods

- Forms may contain additional methods for specific business logic
- Use separate forms for complex workflows such as authentication

**Example Form with Additional Methods:**

```typescript
@Component({
  // ... component configuration
})
export class SignInFormComponent implements OnInit {
  @Output() afterSignIn = new EventEmitter<AuthModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly authFormService: AuthFormService,
  ) {}

  ngOnInit(): void {
    this.authFormService.init().then(() => {
      this.setFieldsAndModel();
    });
  }

  submitForm(): void {
    this.signIn()
      .pipe(
        tap((result) => {
          if (result) {
            this.afterSignIn.next(result);
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private signIn() {
    return this.authService
      .signIn(this.featureMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }
}
```

#### 1.3. Grid Components

#### 1.3.1. CRUD Grids

- Use Ant Design table components for data display
- Implement search, pagination, and sorting functionality
- Use BehaviorSubject for state management
- Implement modal dialogs for create/update operations
- Pass relational filter parameters from grid components to services
- Use ngOnChanges to detect changes in relational inputs and trigger data reload

**Example CRUD Grid:**

```typescript
@Component({
  // ... component configuration
})
export class FeatureGridComponent implements OnInit, OnChanges {
  @Input() relatedEntityId?: string;
  @Input() forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<EntityModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [EntityScalarFieldEnum.id, EntityScalarFieldEnum.name, EntityScalarFieldEnum.description];

  columns = {
    [EntityScalarFieldEnum.id]: 'feature.grid.columns.id',
    [EntityScalarFieldEnum.name]: 'feature.grid.columns.name',
    [EntityScalarFieldEnum.description]: 'feature.grid.columns.description',
  };

  constructor(
    private readonly featureService: FeatureService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  ngOnChanges(changes: NgChanges<FeatureGridComponent>): void {
    // Need for ignore dbl load
    if (!changes['relatedEntityId']?.firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
  }

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      ...(this.forceLoadStream ? this.forceLoadStream : []),
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this),
      )
      .subscribe();

    this.loadMany();
  }

  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    // Handle query parameters and filters
    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    if (!filters['relatedEntityId'] && this.relatedEntityId) {
      filters['relatedEntityId'] = this.relatedEntityId;
    }

    this.featureService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.entities);
          this.meta$.next({ ...result.meta, ...meta });
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<FeatureFormComponent, FeatureFormComponent>({
      nzTitle: id ? `Update ${id}` : 'Create New',
      nzContent: FeatureFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
        relatedEntityId: this.relatedEntityId,
      } as FeatureFormComponent,
      nzFooter: [
        {
          label: 'Cancel',
          onClick: () => modal.close(),
        },
        {
          label: id ? 'Save' : 'Create',
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
        },
      ],
    });
  }
}
```

#### 1.3.2. Grids with Additional Methods

- Grids may contain additional methods for specific functionality
- Use separate grids for complex workflows

**Example Grid with Additional Methods:**

``typescript
@Component({
// ... component configuration
})
export class UserManagementGridComponent implements OnInit {
// ... standard grid properties

constructor(
private readonly userService: UserService,
private readonly nzModalService: NzModalService,
private readonly viewContainerRef: ViewContainerRef,
) {}

// ... standard grid methods

showActivateUserModal(userId: string): void {
const modal = this.nzModalService.confirm({
nzTitle: 'Activate User',
nzContent: 'Are you sure you want to activate this user?',
nzOnOk: () => {
return this.userService
.activate(userId)
.pipe(
tap(() => {
this.loadMany({ force: true });
}),
untilDestroyed(this),
)
.subscribe();
},
});
}

showBlockUserModal(userId: string): void {
const modal = this.nzModalService.confirm({
nzTitle: 'Block User',
nzContent: 'Are you sure you want to block this user?',
nzOnOk: () => {
return this.userService
.block(userId)
.pipe(
tap(() => {
this.loadMany({ force: true });
}),
untilDestroyed(this),
)
.subscribe();
},
});
}
}

```

#### 1.3.3. Grids with View Mode Support

- Grid components should support a view mode that displays a custom title instead of action buttons
- Implement `viewMode` boolean input and `title` string input properties
- Conditionally render action buttons and columns based on view mode
- Prevent modal dialogs from opening in view mode

**Example Grid with View Mode Support:**

``typescript
@Component({
  // ... component configuration
})
export class FeatureGridComponent implements OnInit {
  @Input() relatedEntityId?: string;
  @Input() forceLoadStream?: Observable<unknown>[];

  // View mode inputs
  @Input() viewMode = false;
  @Input() title?: string;

  items$ = new BehaviorSubject<EntityModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [EntityScalarFieldEnum.id, EntityScalarFieldEnum.name, EntityScalarFieldEnum.description];

  columns = {
    [EntityScalarFieldEnum.id]: 'feature.grid.columns.id',
    [EntityScalarFieldEnum.name]: 'feature.grid.columns.name',
    [EntityScalarFieldEnum.description]: 'feature.grid.columns.description',
  };

  constructor(
    private readonly featureService: FeatureService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      ...(this.forceLoadStream ? this.forceLoadStream : []),
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this),
      )
      .subscribe();

    this.loadMany();
  }

  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    // Handle query parameters and filters
    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    if (!filters['relatedEntityId'] && this.relatedEntityId) {
      filters['relatedEntityId'] = this.relatedEntityId;
    }

    this.featureService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.entities);
          this.meta$.next({ ...result.meta, ...meta });
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    // In view mode, don't show the modal
    if (this.viewMode) {
      return;
    }

    const modal = this.nzModalService.create<FeatureFormComponent, FeatureFormComponent>({
      nzTitle: id ? `Update ${id}` : 'Create New',
      nzContent: FeatureFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
        relatedEntityId: this.relatedEntityId,
      } as FeatureFormComponent,
      nzFooter: [
        {
          label: 'Cancel',
          onClick: () => modal.close(),
        },
        {
          label: id ? 'Save' : 'Create',
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
        },
      ],
    });
  }
}
```

In the template, conditionally render action buttons and columns based on view mode:

```
<div class="table-operations" nz-row nzJustify="space-between">
  <div nz-col nzSpan="8">
    <!-- Show either the Create button or the title text based on viewMode -->
    @if (!viewMode) {
      <button nz-button nzType="primary" (click)="showCreateOrUpdateModal()" transloco="Create new"></button>
    } @else {
      <span>{{ title }}</span>
    }
  </div>
  <!-- ... other table operations -->
</div>

<nz-table ...>
  <thead>
    <tr>
      @for (key of keys; track $index) {
        <th [nzColumnKey]="key" [nzSortFn]="true" [nzSortOrder]="meta.sort[key] | nzTableSortOrderDetector"
          [transloco]="columns[key]"></th>
      }
      <!-- Conditionally show the Action column only when not in view mode -->
      @if (!viewMode) {
        <th transloco="Action"></th>
      }
    </tr>
  </thead>
  <tbody>
    @for (data of basicTable.data; track $index) {
      <tr ...>
        <!-- ... data columns ... -->
        <!-- Conditionally show the action buttons only when not in view mode -->
        @if (!viewMode) {
          <td>
            <a (click)="showCreateOrUpdateModal(data.id)" transloco="Edit"></a>
            <!-- ... other action buttons ... -->
          </td>
        }
      </tr>
    }
  </tbody>
</nz-table>
```

### 2. Service Patterns

#### 2.1. CRUD API Services

- Create services wrapping REST API calls
- Implement proper type conversion between API and model objects
- Use RxJS operators for data transformation
- Handle server-side validation errors
- Pass all filter parameters from filters object to API calls
- Maintain parameter order consistency with controller method signatures

**Example CRUD API Service:**

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  constructor(
    private readonly apiService: ApiService,
    private readonly featureMapperService: FeatureMapperService,
  ) {}

  findOne(id: string) {
    return this.apiService
      .getFeatureApi()
      .featureControllerFindOne(id)
      .pipe(map((p) => this.featureMapperService.toModel(p)));
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.apiService
      .getFeatureApi()
      .featureControllerFindMany(
        meta?.curPage,
        meta?.perPage,
        filters['search'],
        meta?.sort
          ? Object.entries(meta?.sort)
              .map(([key, value]) => `${key}:${value}`)
              .join(',')
          : undefined,
        filters['tenantId'],
        filters['relatedEntityId'],
      )
      .pipe(
        map(({ meta, entities }) => ({
          meta,
          entities: entities.map((p) => this.featureMapperService.toModel(p)),
        })),
      );
  }

  updateOne(id: string, data: Record<string, unknown>) {
    return this.apiService
      .getFeatureApi()
      .featureControllerUpdateOne(id, data as any)
      .pipe(map((p) => this.featureMapperService.toModel(p)));
  }

  deleteOne(id: string) {
    return this.apiService.getFeatureApi().featureControllerDeleteOne(id);
  }

  createOne(data: Record<string, unknown>) {
    return this.apiService
      .getFeatureApi()
      .featureControllerCreateOne(data as any)
      .pipe(map((p) => this.featureMapperService.toModel(p)));
  }
}
```

#### 2.2. Mapper Services

- Create mapper services for data transformation between different formats
- Handle date/time conversions with proper timezone handling
- Implement `toModel`, `toForm`, and `toJson` methods for different transformations

**Example Mapper Service:**

```typescript
export interface FeatureModel extends Partial<Omit<FeatureDtoInterface, 'createdAt' | 'updatedAt'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class FeatureMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: FeatureDtoInterface): FeatureModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: FeatureModel) {
    return {
      ...model,
      createdAt: model.createdAt ? new Date(model.createdAt) : null,
    };
  }

  toJson(data: FeatureModel) {
    return {
      name: data.name || null,
      description: data.description || null,
    };
  }
}
```

#### 2.3. Form Services

- Create form services for Formly field configuration
- Implement multilingual support for form labels
- Handle server-side validation errors in form fields

**Example Form Service:**

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFormService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly translocoService: TranslocoService,
  ) {}

  async init() {
    const langIds = this.getAvailableLangs().map((lang) => lang.id);
    for (const langId of langIds) {
      await this.translocoService.load(langId).toPromise();
    }
  }

  getFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: FeatureScalarFieldEnum.name,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`feature.form.fields.name`),
            placeholder: 'Name',
            required: true,
          },
        },
        {
          key: FeatureScalarFieldEnum.description,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`feature.form.fields.description`),
            placeholder: 'Description',
            required: false,
          },
        },
      ],
      options?.errors || [],
    );
  }

  private getAvailableLangs() {
    return this.translocoService.getAvailableLangs() as LangDefinition[];
  }
}
```

#### 2.4. Relational Filter Patterns

- Create specific DTOs extending base FindManyArgs for each controller that needs relational filters
- Pass relational filter parameters from frontend services to backend controllers
- Use consistent naming conventions for relational filter parameters
- Implement proper validation for UUID-type relational parameters

**Example Relational Filter DTO:**

```typescript
// Create specific DTO for each controller with relational filters
export class FindManyEntityWithRelationArgs extends FindManyArgs {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

// Use in controller with proper filter application
async findMany(
  @CurrentExternalTenantId() externalTenantId: string,
  @CurrentUser() user: User,
  @Query() args: FindManyEntityWithRelationArgs,
) {
  const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
    curPage: args.curPage,
    perPage: args.perPage,
  });

  return await this.prismaClient.$transaction(async (prisma) => {
    return {
      entities: await prisma.entity.findMany({
        where: {
          // Search and other conditions
          ...(user.userRole === UserRole.Admin
            ? { tenantId: args.tenantId }
            : {
                tenantId: user?.userRole === UserRole.User ? user.tenantId : externalTenantId,
              }),
          // Relational filters
          ...(args.relatedEntityId
            ? { RelatedEntity: { id: { equals: args.relatedEntityId } } }
            : {}),
          ...(args.userId
            ? { userId: { equals: args.userId } }
            : {}),
        },
        take,
        skip,
        // Sorting
      }),
      totalResults: await prisma.entity.count({
        where: {
          // Same conditions as above
        },
      }),
    };
  });
}
```

**Example Service Implementation with Relational Filters:**

```typescript
findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
  return this.apiService
    .getFeatureApi()
    .featureControllerFindMany(
      meta?.curPage,
      meta?.perPage,
      filters['search'],
      meta?.sort
        ? Object.entries(meta?.sort)
            .map(([key, value]) => `${key}:${value}`)
            .join(',')
        : undefined,
      filters['tenantId'],
      filters['relatedEntityId'],
      filters['userId'],
    )
    .pipe(
      map(({ meta, entities }) => ({
        meta,
        entities: entities.map((p) => this.featureMapperService.toModel(p)),
      })),
    );
}
```

**Example Grid Component with Relational Filters:**

```typescript
@Component({
  // ... component configuration
})
export class FeatureGridComponent implements OnInit, OnChanges {
  @Input() relatedEntityId?: string;
  @Input() userId?: string;

  // ... other inputs and properties

  ngOnChanges(changes: NgChanges<FeatureGridComponent>): void {
    // Reload data when relational inputs change
    if (!changes['relatedEntityId']?.firstChange || !changes['userId']?.firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
  }

  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    // Handle query parameters and filters
    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    // Pass relational filters to service
    if (!filters['relatedEntityId'] && this.relatedEntityId) {
      filters['relatedEntityId'] = this.relatedEntityId;
    }

    if (!filters['userId'] && this.userId) {
      filters['userId'] = this.userId;
    }

    this.featureService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.entities);
          this.meta$.next({ ...result.meta, ...meta });
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
```

### 3. State Management Patterns

#### 3.1. Reactive State

- Use BehaviorSubject for managing component state
- Implement proper subscription cleanup with `untilDestroyed`
- Use RxJS operators for state transformations

**Example of Reactive State:**

```typescript
@Component({
  // ... component configuration
})
export class FeatureComponent implements OnInit {
  items$ = new BehaviorSubject<FeatureModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      // ... other streams
    )
      .pipe(
        tap(() => this.loadData({ force: true })),
        untilDestroyed(this),
      )
      .subscribe();

    this.loadData();
  }

  private loadData(args?: { force?: boolean }) {
    this.featureService
      .findMany({
        /* parameters */
      })
      .pipe(
        tap((result) => {
          this.items$.next(result.entities);
          this.meta$.next(result.meta);
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
```

#### 3.2. Data Flow

- Implement unidirectional data flow
- Use observables for async data handling
- Implement proper error handling for all async operations

**Example of Data Flow:**

```typescript
// Parent component passing data to child
@Component({
  template: `
    <feature-grid [relatedEntityId]="selectedId$ | async" [forceLoadStream]="refreshStream$"> </feature-grid>
  `,
})
export class ParentComponent {
  selectedId$ = new BehaviorSubject<string | null>(null);
  refreshStream$ = new BehaviorSubject<void>(undefined);

  refreshData() {
    this.refreshStream$.next();
  }
}

// Child component receiving and processing data
@Component({
  selector: 'feature-grid',
})
export class FeatureGridComponent implements OnInit {
  @Input() relatedEntityId?: string;
  @Input() forceLoadStream?: Observable<unknown>[];

  // Implementation that uses these inputs
}
```

## Database and ORM Patterns

### 1. Prisma Patterns

#### 1.1. Schema Design

- Use relation-specific field names for connections
- Implement proper indexing for frequently queried fields
- Use appropriate data types for each field
- Follow consistent naming conventions for tables, columns, constraints, and indexes
- Implement multi-tenancy with tenantId field in all entities
- Include audit fields (createdAt, updatedAt, createdBy, updatedBy) in all entities
- Use UUID as primary key type for all entities
- Implement proper foreign key constraints with descriptive names
- Use unique constraints for business keys
- Include descriptive comments for tables and columns

**Example Prisma Schema Design:**

```prisma
// Complete entity with all standard fields
model EntityName {
  /// @DtoCreateHidden
  id          String   @id(map: "PK_ENTITY_NAME") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  name        String   @db.VarChar(255)
  description String?

  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdBy   String   @db.Uuid
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedBy   String   @db.Uuid
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdAt   DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedAt   DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  tenantId    String   @db.Uuid

  // Relations
  User_EntityName_createdByToUser User @relation("EntityName_createdByToUser", fields: [createdBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME__CREATED_BY")
  User_EntityName_updatedByToUser User @relation("EntityName_updatedByToUser", fields: [updatedBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME__UPDATED_BY")
  RelatedEntity RelatedEntity[]

  // Constraints
  @@unique([tenantId, name], map: "UQ_ENTITY_NAME__NAME")
  @@index([tenantId], map: "IDX_ENTITY_NAME__TENANT_ID")
}

// Junction table for many-to-many relations
model EntityNameRelatedEntity {
  /// @DtoCreateHidden
  id              String   @id(map: "PK_ENTITY_NAME_RELATED_ENTITY") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  entityNameId    String   @db.Uuid
  relatedEntityId String   @db.Uuid

  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdBy       String   @db.Uuid
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedBy       String   @db.Uuid
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdAt       DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedAt       DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  tenantId        String   @db.Uuid

  // Relations
  User_EntityNameRelatedEntity_createdByToUser User @relation("EntityNameRelatedEntity_createdByToUser", fields: [createdBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__CREATED_BY")
  EntityName    EntityName    @relation(fields: [entityNameId], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__ENTITY_NAME_ID")
  RelatedEntity RelatedEntity @relation(fields: [relatedEntityId], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__RELATED_ENTITY_ID")
  User_EntityNameRelatedEntity_updatedByToUser User @relation("EntityNameRelatedEntity_updatedByToUser", fields: [updatedBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__UPDATED_BY")

  // Constraints
  @@unique([tenantId, entityNameId, relatedEntityId], map: "UQ_ENTITY_NAME_RELATED_ENTITY__ENTITY_RELATED")
  @@index([tenantId], map: "IDX_ENTITY_NAME_RELATED_ENTITY__TENANT_ID")
}
```

#### 1.2. Query Optimization

- Use select/where clauses to limit data retrieval
- Implement proper pagination for large datasets
- Use transactions for related operations

**Example of Query Optimization:**

```typescript
// Efficient query with proper selection
const entities = await prisma.entity.findMany({
  where: {
    tenantId: userTenantId,
    name: {
      contains: searchText,
      mode: 'insensitive',
    },
  },
  select: {
    id: true,
    name: true,
    description: true,
    createdAt: true,
  },
  take: 20,
  skip: (page - 1) * 20,
  orderBy: {
    createdAt: 'desc',
  },
});

// Transaction for related operations
const result = await prisma.$transaction(async (tx) => {
  const entity = await tx.entity.create({
    data: {
      /* entity data */
    },
  });

  await tx.entityLog.create({
    data: {
      entityId: entity.id,
      action: 'CREATE',
      timestamp: new Date(),
    },
  });

  return entity;
});
```

### 2. Database Migrations

#### 2.1. Migration Management with pg-flyway

- The project does not use Prisma migrations, instead the pg-flyway tool is used for database migration management
- Create migrations with descriptive names in format: `V{yyyyMMddkkmm}__{Description}.sql` (https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)
- Implement proper baseline and verification procedures
- Use defensive DDL with exception handling for idempotent migrations
- Include table and column comments for documentation
- Follow consistent naming conventions for constraints and indexes
- Implement multi-tenancy support in all tables
- **Migrations must be restartable/idempotent - use IF NOT EXISTS clauses and exception handling so migrations can be safely re-run**

**Example Migration Structure:**

``sql
-- V202507191859\_\_Init.sql
-- Migration: Create initial tables for feature
-- Description: Creates tables, indexes, and constraints for feature

-- First create enum types
DO $$
BEGIN
CREATE TYPE "EntityStatus" AS enum(
'Active',
'Inactive'
);
EXCEPTION
WHEN duplicate_object THEN
NULL;
END

$$
;

--

-- Create main entity table
CREATE TABLE IF NOT EXISTS "EntityName"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "status" "EntityStatus" NOT NULL DEFAULT 'Active',
    "createdBy" uuid NOT NULL CONSTRAINT "FK_ENTITY_NAME__CREATED_BY" REFERENCES "User",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_ENTITY_NAME__UPDATED_BY" REFERENCES "User",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

--

-- Add table comments
COMMENT ON TABLE "EntityName" IS 'Entity description';

--

-- Add column comments
COMMENT ON COLUMN "EntityName".id IS 'Primary key: unique entity identifier';
COMMENT ON COLUMN "EntityName"."name" IS 'Entity name';
COMMENT ON COLUMN "EntityName"."description" IS 'Entity description';
COMMENT ON COLUMN "EntityName"."status" IS 'Entity status';
COMMENT ON COLUMN "EntityName"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "EntityName"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "EntityName"."tenantId" IS 'Tenant identifier for multi-tenancy';

--

-- Add primary key constraint
DO
$$

BEGIN
ALTER TABLE "EntityName"
ADD CONSTRAINT "PK_ENTITY_NAME" PRIMARY KEY(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
WHEN invalid_table_definition THEN
NULL;
END

$$
;

--

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ENTITY_NAME__NAME" ON "EntityName"("tenantId", "name");

--

-- Add indexes
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME__TENANT_ID" ON "EntityName"("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME__STATUS" ON "EntityName"("tenantId", "status");

--
-- Create junction table for many-to-many relations
CREATE TABLE IF NOT EXISTS "EntityNameRelatedEntity"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "entityNameId" uuid NOT NULL,
    "relatedEntityId" uuid NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY__CREATED_BY" REFERENCES "User",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY__UPDATED_BY" REFERENCES "User",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

--

COMMENT ON TABLE "EntityNameRelatedEntity" IS 'Relationship between entities and related entities';

--

DO
$$

BEGIN
ALTER TABLE "EntityNameRelatedEntity"
ADD CONSTRAINT "PK_ENTITY_NAME_RELATED_ENTITY" PRIMARY KEY(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
WHEN invalid_table_definition THEN
NULL;
END

$$
;

--

-- Add foreign key constraints
DO
$$

BEGIN
ALTER TABLE "EntityNameRelatedEntity"
ADD CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY\_\_ENTITY_NAME_ID" FOREIGN KEY("entityNameId") REFERENCES "EntityName"(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
END

$$
;

--

DO
$$

BEGIN
ALTER TABLE "EntityNameRelatedEntity"
ADD CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY\_\_RELATED_ENTITY_ID" FOREIGN KEY("relatedEntityId") REFERENCES "RelatedEntity"(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
END

$$
;

--

-- Add unique constraints for junction table
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ENTITY_NAME_RELATED_ENTITY__ENTITY_RELATED" ON "EntityNameRelatedEntity"("tenantId", "entityNameId", "relatedEntityId");

--

-- Add indexes for junction table
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME_RELATED_ENTITY__TENANT_ID" ON "EntityNameRelatedEntity"("tenantId");
```

#### 2.2. Schema Generation

- Use database introspection tools to generate schema from existing databases
- Generate client code after schema changes
- Implement proper environment configuration for different target deployments
- **Always ask user permission before applying migrations. If user agrees, apply migrations with `npm run db:create-and-fill`**
- Prisma schema is not manually described, it is created through prisma pull from existing database, then we add options for generators and annotations for fields and tables to customize generated code
- CRUD operations for entities are implemented directly in controllers without separate description in services - this is not the best practice but acceptable for development speed

**Example Schema Generation Commands:**

```
# Generate Prisma schema from existing database
npx prisma db pull --schema=./src/prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=./src/prisma/schema.prisma
```

## Internationalization Patterns

### 1. Translation Implementation

- Use translation libraries for internationalization
- Implement marker functions for extracting translation keys
- Create separate translation files for each feature module
- Use translation pipes and directives in templates
- Translations are collected from code into POT files
- POT files can be located in both applications and libraries
- When running `npm run translates`, PO and JSON translation files are generated
- All translations from libraries and node_modules are collected in applications
- Translations are manually edited in PO files or with Poedit
- After editing, run `npm run translates` to update JSON files

**Example Translation Implementation:**

```typescript
// Component with translations
@Component({
  template: `
    <h1>{{ 'feature.title' | transloco }}</h1>
    <p>{{ translocoService.translate('feature.description') }}</p>
  `,
})
export class FeatureComponent {
  constructor(private readonly translocoService: TranslocoService) {}
}

// Translation key markers
import { marker } from '@jsverse/transloco-keys-manager/marker';

export class FeatureGridComponent {
  columns = {
    [FeatureScalarFieldEnum.id]: marker('feature.grid.columns.id'),
    [FeatureScalarFieldEnum.name]: marker('feature.grid.columns.name'),
  };
}
```

**Example Translation Files:**

```json
// assets/i18n/en.json
{
  "feature": {
    "title": "Feature Management",
    "description": "Manage your features here",
    "grid": {
      "columns": {
        "id": "ID",
        "name": "Name"
      }
    },
    "form": {
      "fields": {
        "name": "Name",
        "description": "Description"
      }
    }
  }
}

// assets/i18n/ru.json
{
  "feature": {
    "title": "Управление функциями",
    "description": "Управляйте своими функциями здесь",
    "grid": {
      "columns": {
        "id": "ID",
        "name": "Название"
      }
    },
    "form": {
      "fields": {
        "name": "Название",
        "description": "Описание"
      }
    }
  }
}
```

### 2. Form Labels and Grid Columns

- Use translation keys for all user-visible text
- Implement proper key naming conventions
- Support multiple languages

**Example Form Labels:**

```typescript
getFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
  return this.validationService.appendServerErrorsAsValidatorsToFields(
    [
      {
        key: FeatureScalarFieldEnum.name,
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: this.translocoService.translate(`feature.form.fields.name`),
          placeholder: this.translocoService.translate(`feature.form.placeholders.name`),
          required: true,
        },
      },
    ],
    options?.errors || [],
  );
}
```

## Error Handling Patterns

### 1. Server-Side Errors

- Implement custom error classes for specific error types
- Use proper HTTP status codes
- Include error details in response bodies
- Implement error filtering and logging
- Use enums for error codes with descriptive names
- Implement automatic error message generation based on codes
- Add metadata to errors for additional information

**Example Server-Side Error Handling (Implemented Solutions):**

```typescript
// Custom error classes with automatic message generation
export class SsoError<T = unknown> extends Error {
  override message: string;
  code = SsoErrorEnum.COMMON;
  metadata?: T;

  constructor(message?: string | SsoErrorEnum, code?: SsoErrorEnum | T, metadata?: T) {
    const codeAsMetadata = Boolean(code && !Object.values(SsoErrorEnum).includes(String(code) as SsoErrorEnum));
    const messageAsCode = Boolean(message && Object.values(SsoErrorEnum).includes(message as SsoErrorEnum));
    const preparedCode = messageAsCode ? (message as SsoErrorEnum) : code;
    const preparedMessage =
      messageAsCode && preparedCode ? SSO_ERROR_ENUM_TITLES[preparedCode as SsoErrorEnum] : message;

    metadata = codeAsMetadata ? (code as T) : metadata;
    code = preparedCode || SsoErrorEnum.COMMON;
    message = preparedMessage || SSO_ERROR_ENUM_TITLES[code as SsoErrorEnum];

    super(message);

    this.code = code as SsoErrorEnum;
    this.message = message;
    this.metadata = metadata;
  }
}

export enum SsoErrorEnum {
  COMMON = 'SSO-000',
  UserNotFound = 'SSO-001',
  WrongPassword = 'SSO-002',
  UserIsExists = 'SSO-003',
  ActivateEmailWrongCode = 'SSO-004',
  ActivateEmailNotProcessed = 'SSO-005',
  ActivateEmailProcessed = 'SSO-006',
  RefreshTokenNotProvided = 'SSO-007',
  SessionExpired = 'SSO-008',
  InvalidRefreshSession = 'SSO-009',
  AccessTokenExpired = 'SSO-010',
  EmailIsExists = 'SSO-011',
  EmailNotVerified = 'SSO-012',
  Forbidden = 'SSO-013',
  WrongOldPassword = 'SSO-014',
  NonExistentRoleSpecified = 'SSO-015',
  BadAccessToken = 'SSO-016',
  YourSessionHasBeenBlocked = 'SSO-017',
  VerificationCodeNotFound = 'SSO-018',
}

// SSO_ERROR_ENUM_TITLES contains translations for each error code
export const SSO_ERROR_ENUM_TITLES: Record<SsoErrorEnum, string> = {
  [SsoErrorEnum.COMMON]: getText('Sso error'),
  [SsoErrorEnum.UserNotFound]: getText('User not found'),
  [SsoErrorEnum.WrongPassword]: getText('Wrong password'),
  [SsoErrorEnum.UserIsExists]: getText('User is exists'),
  [SsoErrorEnum.ActivateEmailWrongCode]: getText('Wrong activate email code'),
  [SsoErrorEnum.ActivateEmailNotProcessed]: getText('Activate email not processed'),
  [SsoErrorEnum.ActivateEmailProcessed]: getText('Activate email processed'),
  [SsoErrorEnum.RefreshTokenNotProvided]: getText('Refresh token not provided'),
  [SsoErrorEnum.SessionExpired]: getText('Session expired'),
  [SsoErrorEnum.InvalidRefreshSession]: getText('Invalid refresh session'),
  [SsoErrorEnum.AccessTokenExpired]: getText('Access token expired'),
  [SsoErrorEnum.EmailIsExists]: getText('User is exists'),
  [SsoErrorEnum.EmailNotVerified]: getText('Email not verified'),
  [SsoErrorEnum.Forbidden]: getText('Forbidden'),
  [SsoErrorEnum.WrongOldPassword]: getText('Wrong old password'),
  [SsoErrorEnum.NonExistentRoleSpecified]: getText('Non-existent role specified'),
  [SsoErrorEnum.BadAccessToken]: getText('Bad access token'),
  [SsoErrorEnum.YourSessionHasBeenBlocked]: getText('Your session has been blocked'),
  [SsoErrorEnum.VerificationCodeNotFound]: getText('Verification code not found'),
};

// Error filter with logging
@Catch(SsoError)
export class SsoExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(SsoExceptionsFilter.name);

  override catch(exception: SsoError, host: ArgumentsHost) {
    if (exception instanceof SsoError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          exception.code === SsoErrorEnum.AccessTokenExpired ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST,
        ),
        host,
      );
    } else {
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
```

### 2. Client-Side Errors

- Handle server validation errors in forms
- Display user-friendly error messages
- Implement proper error state management
- Use UI components for displaying errors

**Example Client-Side Error Handling:**

```typescript
@Injectable({ providedIn: 'root' })
export class ValidationService {
  catchAndProcessServerError(
    err: any,
    callback: (options: { errors: ValidationErrorMetadataInterface[] }) => void
  ) {
    if (err.status === 400 && err.error?.validationErrors) {
      const errors = err.error.validationErrors.map((ve: any) => ({
        property: ve.property,
        constraints: ve.constraints,
      }));
      callback({ errors });
      return EMPTY;
    }
    return throwError(() => err);
  }
}

// In form component
private createOne() {
  return this.featureService
    .createOne(this.form.value)
    .pipe(
      catchError((err) =>
        this.validationService.catchAndProcessServerError(
          err,
          (options) => this.setFormlyFields(options)
        ),
      ),
    );
}
```

## Testing Patterns

### 1. Unit Testing

- Use testing frameworks for unit testing
- Implement proper test setup and teardown
- Use mocking for external dependencies
- Test both positive and negative scenarios

**Example Unit Testing:**

``typescript
describe('FeatureService', () => {
  let service: FeatureService;
  let apiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    apiService = {
      getFeatureApi: jest.fn(),
    } as any;

    service = new FeatureService(apiService, new FeatureMapperService());
  });

  describe('createOne', () => {
    it('should create an entity successfully', (done) => {
      const mockEntity = { id: '1', name: 'Test' };
      apiService.getFeatureApi.mockReturnValue({
        featureControllerCreateOne: jest.fn().mockReturnValue(of(mockEntity)),
      } as any);

      service.createOne({ name: 'Test' }).subscribe({
        next: (result) => {
          expect(result).toEqual(mockEntity);
          done();
        },
      });
    });

    it('should handle errors properly', (done) => {
      apiService.getFeatureApi.mockReturnValue({
        featureControllerCreateOne: jest.fn().mockReturnValue(throwError(() => new Error('Failed'))),
      } as any);

      service.createOne({ name: 'Test' }).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error);
          done();
        },
      });
    });
  });
});
```

### 2. End-to-End Testing

- Use E2E testing frameworks for integration testing
- Implement page object patterns
- Test user workflows and integration points
- Use proper test data management

**Example E2E Testing:**

```typescript
// page-object.ts
export class FeaturePage {
  constructor(private readonly page: Page) {}

  async navigateTo() {
    await this.page.goto('/feature');
  }

  async createEntity(name: string) {
    await this.page.click('button[data-testid="create-button"]');
    await this.page.fill('input[name="name"]', name);
    await this.page.click('button[type="submit"]');
  }

  async getEntityCount() {
    return await this.page.locator('table tbody tr').count();
  }
}

// feature.spec.ts
test.describe('Feature Management', () => {
  test('should create a new entity', async ({ page }) => {
    const featurePage = new FeaturePage(page);

    await featurePage.navigateTo();
    const initialCount = await featurePage.getEntityCount();

    await featurePage.createEntity('Test Entity');

    const finalCount = await featurePage.getEntityCount();
    expect(finalCount).toBe(initialCount + 1);
  });
});
```

## Deployment and Infrastructure Patterns

### 1. Environment Configuration

- Use environment variables for configuration
- Implement proper environment validation
- Use feature-specific naming conventions for environment
- Support multiple deployment targets (dev, prod, etc.)

**Example Environment Configuration:**

```typescript
// environments.ts
export class FeatureStaticEnvironments {
  @EnvFieldType({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  databaseUrl!: string;

  @EnvFieldType({ type: 'boolean' })
  @IsBoolean()
  useGuards!: boolean;

  @EnvFieldType({ type: 'boolean' })
  @IsBoolean()
  useFilters!: boolean;
}

// .env file
FEATURE_DATABASE_URL=postgresql://user:password@localhost:5432/feature
FEATURE_USE_GUARDS=true
FEATURE_USE_FILTERS=true
```

### 2. Docker and Containerization

- Use Docker for containerization
- Implement proper container networking
- Use environment files for configuration
- Support both development and production configurations

**Example Docker Configuration:**

```
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  feature-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - FEATURE_DATABASE_URL=postgresql://postgres:password@db:5432/feature
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=feature
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. CI/CD Patterns

- Implement proper build and deployment scripts
- Use monorepo management tools
- Implement automated testing in CI pipelines
- Use semantic versioning for releases

**Example CI/CD Configuration:**

```
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## Code Organization Patterns

### 1. Project Structure

- Use monorepo structure for multiple applications
- Organize code by feature modules
- Separate frontend and backend code
- Implement proper library boundaries

**Example Project Structure:**

```
project/
├── apps/
│   ├── api/
│   └── client/
├── libs/
│   ├── feature/
│   │   ├── feature-name/
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── types/
│   │   │   │   │   └── feature.module.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── test/
│   │   │   └── project.json
│   │   └── feature-name-afat/
│   │       ├── src/
│   │       │   ├── lib/
│   │       │   │   ├── forms/
│   │       │   │   ├── grids/
│   │       │   │   ├── services/
│   │       │   │   └── feature-name.module.ts
│   │       │   ├── index.ts
│   │       │   └── test/
│   │       └── project.json
│   └── shared/
└── tools/
```

### 2. File Naming Conventions

- Use descriptive file names matching class/component names
- Use consistent naming patterns (kebab-case for files, PascalCase for classes)
- Group related files in appropriate directories
- Use index.ts files for module exports
- Barrel files are created automatically through running `npm run make-ts-list` command

**Example Naming Conventions:**

```
feature-name/
├── src/
│   ├── lib/
│   │   ├── controllers/
│   │   │   ├── feature-name.controller.ts
│   │   │   └── feature-name.controller.spec.ts
│   │   ├── services/
│   │   │   ├── feature-name.service.ts
│   │   │   └── feature-name.service.spec.ts
│   │   ├── types/
│   │   │   ├── create-full-feature-name.dto.ts
│   │   │   └── find-many-feature-name.args.ts
│   │   └── feature-name.module.ts
│   ├── index.ts
│   └── test/
│       └── feature-name.spec.ts
```

### 3. Code Style and Formatting

- Use linters for code quality checking
- Implement code formatters for consistent formatting
- Follow TypeScript best practices
- Use proper import organization

**Example Code Style Configuration:**

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
$$
