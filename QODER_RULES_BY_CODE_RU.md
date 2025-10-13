# Правила QODER по анализу кода

Этот документ содержит шаблоны разработки и правила, извлеченные из фактических реализаций кода в проекте. Эти правила должны использоваться Qoder для поддержания согласованности и следования установленным шаблонам.

> **Примечание**: Для правильного форматирования блоков кода в документации ознакомьтесь с [Паттерном правильных вставок кода](./docs/patterns/correct-code-insertions-ru.md)

## Шаблоны разработки бэкенда

### 1. Шаблоны контроллеров

#### 1.1. CRUD контроллеры

- Все CRUD контроллеры должны расширять базовые операции (findMany, findOne, createOne, updateOne, deleteOne)
- Используйте декораторы `@nestjs/common` для HTTP-методов
- Используйте `@nestjs/swagger` для документации API
- Реализуйте надлежащую обработку ошибок с `@nestjs-mod/validation`
- Используйте клиент Prisma для операций с базой данных

**Пример структуры контроллера:**

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
    // Реализация
  }

  @Post()
  @ApiCreatedResponse({ type: EntityDto })
  async createOne(@Body() args: CreateEntityDto) {
    // Реализация
  }

  @Put(':id')
  @ApiOkResponse({ type: EntityDto })
  async updateOne(@Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateEntityDto) {
    // Реализация
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(@Param('id', new ParseUUIDPipe()) id: string, @InjectTranslateFunction() getText: TranslateFunction) {
    // Реализация
  }

  @Get(':id')
  @ApiOkResponse({ type: EntityDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    // Реализация
  }
}
```

#### 1.2. Обработка полей в контроллерах

- **Явное перечисление полей**: Контроллеры должны явно перечислять поля во время вставки и обновления вместо использования деструктуризации
- **Пропуск реляционных полей**: Поля для реляционных соединений должны быть пропущены в основном перечислении полей
- **Условное присваивание полей**: Используйте шаблон `...(args.fieldName !== undefined ? { fieldName: args.fieldName } : {})` для необязательных полей

**Пример явного перечисления полей:**

```typescript
// Правильный подход - явное перечисление полей
return await this.prismaClient.entity.create({
  data: {
    field1: args.field1,
    field2: args.field2,
    ...(args.optionalField !== undefined ? { optionalField: args.optionalField } : {}),
    // Реляционные поля обрабатываются отдельно
    RelatedEntity: { connect: { id: args.relatedEntityId } },
  },
});

// Неправильный подход - использование деструктуризации
return await this.prismaClient.entity.create({
  data: {
    ...args, // Не делайте так
    RelatedEntity: { connect: { id: args.relatedEntityId } },
  },
});
```

#### 1.3. Обработка контекста пользователя

- Всегда внедряйте контекст пользователя с помощью пользовательских декораторов
- Обрабатывайте изоляцию арендаторов с помощью декораторов внешнего ID арендатора
- Подключайте текущего пользователя как создателя/обновляющего с использованием имен полей отношений

**Пример обработки контекста пользователя:**

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
      // Поля сущности
      name: args.name,
      description: args.description,

      // Соединения пользователей
      User_Entity_createdByToUser: { connect: { id: user.id } },
      User_Entity_updatedByToUser: { connect: { id: user.id } },

      // Обработка арендаторов
      ...(user.userRole === UserRole.Admin
        ? { tenantId: externalTenantId }
        : {
            tenantId: user?.userRole === UserRole.User ? user.tenantId : externalTenantId,
          }),
    },
  });
}
```

#### 1.4. Контроль доступа на основе ролей

- Используйте пользовательские декораторы для проверки ролей
- Реализуйте фильтрацию на основе арендаторов в запросах в зависимости от роли пользователя
- Администраторы могут получить доступ ко всем арендаторам, обычные пользователи - только к своему

**Пример контроля доступа на основе ролей:**

```typescript
@CheckRole([UserRole.User, UserRole.Admin])
@Controller('/feature/name')
export class FeatureNameController {
  // Реализация контроллера

  async findMany(
    @CurrentExternalTenantId() externalTenantId: string,
    @CurrentUser() user: User,
    @Query() args: FindManyArgs,
  ) {
    return await this.prismaClient.$transaction(async (prisma) => {
      return {
        entities: await prisma.entity.findMany({
          where: {
            // Условия поиска
            ...(args.searchText
              ? {
                  OR: [
                    { name: { contains: args.searchText, mode: 'insensitive' } },
                    { description: { contains: args.searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),

            // Фильтрация арендаторов на основе роли
            ...(user.userRole === UserRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: user?.userRole === UserRole.User ? user.tenantId : externalTenantId,
                }),
          },
          // Пагинация и сортировка
        }),
        totalResults: await prisma.entity.count({
          where: {
            // Те же условия, что и выше
          },
        }),
      };
    });
  }
}
```

#### 1.5. Валидация данных

- Используйте DTO для валидации входных данных с декораторами `class-validator`
- Расширяйте сгенерированные DTO для дополнительных требований валидации
- Используйте декораторы `ApiProperty` для документации Swagger

**Пример валидации DTO:**

```typescript
// Базовый DTO (сгенерированный)
export class CreateEntityDto {
  name: string;
  description?: string | null;
}

// Расширенный DTO с валидацией
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

### 2. Шаблоны сервисов

#### 2.1. CRUD сервисы

- CRUD сервисы должны реализовывать базовые операции (create, findMany, findOne, update, delete)
- Внедряйте клиент Prisma с использованием токенов внедрения, специфичных для функции
- Используйте транзакции для операций, требующих атомарности
- Реализуйте надлежащую обработку ошибок и преобразование типов

**Пример CRUD сервиса:**

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
      // Выполняем несколько связанных операций атомарно
      const entity = await prisma.entity.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Дополнительные операции, связанные с созданием сущности
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

#### 2.2. Сервисы с дополнительными методами

- Сервисы могут содержать дополнительные методы для бизнес-логики, таких как аутентификация, активация и другие
- Дополнительные методы должны следовать тем же принципам обработки ошибок и транзакций
- Используйте отдельные методы для сложных бизнес-операций

**Пример сервиса с дополнительными методами:**

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

#### 2.3. Шаблоны запросов

- Реализуйте функциональность поиска с условиями OR для нескольких полей
- Используйте пагинацию с параметрами take/skip
- Реализуйте сортировку с динамической проверкой полей
- Применяйте фильтрацию арендаторов на основе роли пользователя

**Пример шаблонов запросов:**

```typescript
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
          // Те же условия, что и выше
        },
      },    });
  }
}
```

### 3. Шаблоны DTO

#### 3.1. DTO для создания

- Расширяйте базовые DTO, сгенерированные Prisma
- Добавляйте декораторы валидации для обязательных полей
- Используйте префикс `CreateFull` для DTO, включающих реляционные поля
- Не включайте `externalUserId` в расширенные DTO для создания

**Пример DTO для создания:**

```typescript
// Базовый DTO (сгенерированный Prisma)
export class CreateEntityDto {
  name: string;
  description?: string | null;
}

// Расширенный DTO с валидацией
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullEntityDto extends CreateEntityDto {
  @ApiProperty({
    type: 'string',
    description: 'ID связанной сущности',
  })
  @IsNotEmpty()
  @IsString()
  relatedEntityId!: string;

  @ApiProperty({
    type: 'string',
    description: 'Необязательное поле',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

#### 3.2. DTO для обновления

- Расширяйте базовые DTO обновления, сгенерированные Prisma
- Делайте все поля необязательными для поддержки частичных обновлений
- Используйте шаблон `PartialType` для операций обновления

**Пример DTO для обновления:**

```typescript
// Базовый DTO (сгенерированный Prisma)
export class UpdateEntityDto {
  name?: string | null;
  description?: string | null;
}

// Расширенный DTO с дополнительной валидацией при необходимости
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFullEntityDto extends UpdateEntityDto {
  @ApiProperty({
    type: 'string',
    description: 'Необязательное поле для обновления',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### 4. Шаблоны модулей

#### 4.1. Простая структура модуля

- Используйте функцию `createNestModule` для создания модулей
- Определяйте надлежащие категории модулей (feature, infrastructure и т.д.)
- Реализуйте конфигурацию среды с надлежащими соглашениями об именовании
- Используйте имена контекстов, специфичные для функций, для Prisma и других сервисов

**Пример простой структуры модуля:**

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

#### 4.2. Расширенная структура модуля

- Расширенная структура модуля позволяет динамически создавать контроллеры или сервисы
- Используйте эту структуру когда необходимо условное создание компонентов
- Применяйте guards и filters условно на основе настроек среды

**Пример расширенной структуры модуля:**

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

## Шаблоны разработки фронтенда

### 1. Шаблоны компонентов

#### 1.1. Автономные компоненты

- Используйте автономные компоненты Angular с явными импортами
- Реализуйте `ChangeDetectionStrategy.OnPush` для лучшей производительности
- Используйте декоратор `@UntilDestroy()` для автоматической очистки подписок

**Пример автономного компонента:**

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
    // Инициализация компонента
  }
}
```

#### 1.2. Компоненты форм

#### 1.2.1. CRUD формы

- Реализуйте реактивные формы с `UntypedFormGroup`
- Используйте Formly для динамической конфигурации форм
- Обрабатывайте отправку формы с надлежащей обработкой ошибок
- Реализуйте логику создания/обновления на основе наличия ID

**Пример CRUD формы:**

```typescript
@Component({
  // ... конфигурация компонента
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

#### 1.2.2. Формы с дополнительными методами

- Формы могут содержать дополнительные методы для специфичной бизнес-логики
- Используйте отдельные формы для сложных рабочих процессов, таких как аутентификация

**Пример формы с дополнительными методами:**

```typescript
@Component({
  // ... конфигурация компонента
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

#### 1.3. Компоненты таблиц

#### 1.3.1. CRUD таблицы

- Используйте компоненты таблиц Ant Design для отображения данных
- Реализуйте функциональность поиска, пагинации и сортировки
- Используйте BehaviorSubject для управления состоянием
- Реализуйте модальные диалоги для операций создания/обновления

**Пример CRUD таблицы:**

```typescript
@Component({
  // ... конфигурация компонента
})
export class FeatureGridComponent implements OnInit {
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

    // Обработка параметров запроса и фильтров
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
      nzTitle: id ? `Обновить ${id}` : 'Создать новый',
      nzContent: FeatureFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
        relatedEntityId: this.relatedEntityId,
      } as FeatureFormComponent,
      nzFooter: [
        {
          label: 'Отмена',
          onClick: () => modal.close(),
        },
        {
          label: id ? 'Сохранить' : 'Создать',
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

#### 1.3.2. Гриды с дополнительными методами

- Таблицы могут содержать дополнительные методы для специфичной функциональности
- Используйте отдельные таблицы для сложных рабочих процессов

**Пример таблицы с дополнительными методами:**

```typescript
@Component({
  // ... конфигурация компонента
})
export class UserManagementGridComponent implements OnInit {
  // ... стандартные свойства таблицы

  constructor(
    private readonly userService: UserService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  // ... стандартные методы таблицы

  showActivateUserModal(userId: string): void {
    const modal = this.nzModalService.confirm({
      nzTitle: 'Активировать пользователя',
      nzContent: 'Вы уверены, что хотите активировать этого пользователя?',
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
      nzTitle: 'Заблокировать пользователя',
      nzContent: 'Вы уверены, что хотите заблокировать этого пользователя?',
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

### 2. Шаблоны сервисов

#### 2.1. CRUD API сервисы

- Создавайте сервисы, оборачивающие вызовы REST API
- Реализуйте надлежащее преобразование типов между API и объектами модели
- Используйте операторы RxJS для преобразования данных
- Обрабатывайте ошибки валидации на стороне сервера

**Пример CRUD API сервиса:**

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

#### 2.2. Сервисы маппинга

- Создавайте сервисы маппинга для преобразования данных между различными форматами
- Обрабатывайте преобразования даты/времени с надлежащей обработкой часовых поясов
- Реализуйте методы `toModel`, `toForm` и `toJson` для различных преобразований

**Пример сервиса маппинга:**

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

#### 2.3. Сервисы форм

- Создавайте сервисы форм для конфигурации полей Formly
- Реализуйте поддержку нескольких языков для меток форм
- Обрабатывайте ошибки валидации на стороне сервера в полях формы

**Пример сервиса форм:**

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
            placeholder: 'Название',
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
            placeholder: 'Описание',
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

### 3. Шаблоны управления состоянием

#### 3.1. Реактивное состояние

- Используйте BehaviorSubject для управления состоянием компонентов
- Реализуйте надлежащую очистку подписок с `untilDestroyed`
- Используйте операторы RxJS для преобразований состояния

**Пример реактивного состояния:**

```typescript
@Component({
  // ... конфигурация компонента
})
export class FeatureComponent implements OnInit {
  items$ = new BehaviorSubject<FeatureModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      // ... другие потоки
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
        /* параметры */
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

#### 3.2. Поток данных

- Реализуйте однонаправленный поток данных
- Используйте observables для асинхронной обработки данных
- Реализуйте надлежащую обработку ошибок для всех асинхронных операций

**Пример потока данных:**

```typescript
// Родительский компонент, передающий данные дочернему
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

// Дочерний компонент, принимающий и обрабатывающий данные
@Component({
  selector: 'feature-grid',
})
export class FeatureGridComponent implements OnInit {
  @Input() relatedEntityId?: string;
  @Input() forceLoadStream?: Observable<unknown>[];

  // Реализация, использующая эти входные данные
  // ...
}
```

## Шаблоны баз данных и ORM

### 1. Шаблоны Prisma

#### 1.1. Проектирование схемы

- Используйте имена полей отношений, специфичные для соединений
- Реализуйте надлежащую индексацию для часто запрашиваемых полей
- Используйте соответствующие типы данных для каждого поля
- Следуйте согласованным соглашениям об именовании для таблиц, столбцов, ограничений и индексов
- Реализуйте многотенантность с полем tenantId во всех сущностях
- Включайте поля аудита (createdAt, updatedAt, createdBy, updatedBy) во все сущности
- Используйте UUID в качестве типа первичного ключа для всех сущностей
- Реализуйте надлежащие ограничения внешних ключей с описательными именами
- Используйте уникальные ограничения для бизнес-ключей
- Включайте описательные комментарии для таблиц и столбцов

**Пример проектирования схемы Prisma:**

```prisma
// Полная сущность со всеми стандартными полями
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

  // Отношения
  User_EntityName_createdByToUser User @relation("EntityName_createdByToUser", fields: [createdBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME__CREATED_BY")
  User_EntityName_updatedByToUser User @relation("EntityName_updatedByToUser", fields: [updatedBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME__UPDATED_BY")
  RelatedEntity RelatedEntity[]

  // Ограничения
  @@unique([tenantId, name], map: "UQ_ENTITY_NAME__NAME")
  @@index([tenantId], map: "IDX_ENTITY_NAME__TENANT_ID")
}

// Таблица соединения для отношений многие-ко-многим
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

  // Отношения
  User_EntityNameRelatedEntity_createdByToUser User @relation("EntityNameRelatedEntity_createdByToUser", fields: [createdBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__CREATED_BY")
  EntityName    EntityName    @relation(fields: [entityNameId], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__ENTITY_NAME_ID")
  RelatedEntity RelatedEntity @relation(fields: [relatedEntityId], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__RELATED_ENTITY_ID")
  User_EntityNameRelatedEntity_updatedByToUser User @relation("EntityNameRelatedEntity_updatedByToUser", fields: [updatedBy], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "FK_ENTITY_NAME_RELATED_ENTITY__UPDATED_BY")

  // Ограничения
  @@unique([tenantId, entityNameId, relatedEntityId], map: "UQ_ENTITY_NAME_RELATED_ENTITY__ENTITY_RELATED")
  @@index([tenantId], map: "IDX_ENTITY_NAME_RELATED_ENTITY__TENANT_ID")
}
```

#### 1.2. Оптимизация запросов

- Используйте предложения select/where для ограничения извлечения данных
- Реализуйте надлежащую пагинацию для больших наборов данных
- Используйте транзакции для связанных операций

**Пример оптимизации запросов:**

```typescript
// Эффективный запрос с надлежащим выбором
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

// Транзакция для связанных операций
const result = await prisma.$transaction(async (tx) => {
  const entity = await tx.entity.create({
    data: {
      /* данные сущности */
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

### 2. Миграции баз данных

#### 2.1. Управление миграциями через pg-flyway

- В проекте не используются миграции Prisma, вместо этого применяется инструмент pg-flyway для управления миграциями базы данных
- Создавайте миграции с описательными именами в формате: `V{yyyyMMddkkmm}__{Description}.sql` (https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table)
- Реализуйте надлежащие процедуры базового уровня и проверки
- Используйте защитный DDL с обработкой исключений для идемпотентных миграций
- Включайте комментарии к таблицам и столбцам для документации
- Следуйте согласованным соглашениям об именовании для ограничений и индексов
- Реализуйте поддержку многотенантности во всех таблицах
- **Миграции должны быть перезапускаемыми/идемпотентными - используйте предложения IF NOT EXISTS и обработку исключений, чтобы миграции можно было безопасно повторно запускать**

**Пример структуры миграции:**

```sql
-- V202507191859__Init.sql
-- Миграция: Создание начальных таблиц для функции
-- Описание: Создает таблицы, индексы и ограничения для функции

-- Сначала создаем типы перечислений
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
$$;

--

-- Создаем основную таблицу сущности
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

-- Добавляем комментарии к таблице
COMMENT ON TABLE "EntityName" IS 'Описание сущности';

--

-- Добавляем комментарии к столбцам
COMMENT ON COLUMN "EntityName".id IS 'Первичный ключ: уникальный идентификатор сущности';
COMMENT ON COLUMN "EntityName"."name" IS 'Название сущности';
COMMENT ON COLUMN "EntityName"."description" IS 'Описание сущности';
COMMENT ON COLUMN "EntityName"."status" IS 'Статус сущности';
COMMENT ON COLUMN "EntityName"."createdAt" IS 'Временная метка создания записи';
COMMENT ON COLUMN "EntityName"."updatedAt" IS 'Временная метка обновления записи';
COMMENT ON COLUMN "EntityName"."tenantId" IS 'Идентификатор арендатора для многотенантности';

--

-- Добавляем ограничение первичного ключа
DO $$
BEGIN
ALTER TABLE "EntityName"
ADD CONSTRAINT "PK_ENTITY_NAME" PRIMARY KEY(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
WHEN invalid_table_definition THEN
NULL;
END
$$;

--

-- Добавляем уникальные ограничения
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ENTITY_NAME__NAME" ON "EntityName"("tenantId", "name");

--

-- Добавляем индексы
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME__TENANT_ID" ON "EntityName"("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME__STATUS" ON "EntityName"("tenantId", "status");

--
-- Создаем таблицу соединения для отношений многие-ко-многим
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

COMMENT ON TABLE "EntityNameRelatedEntity" IS 'Отношение между сущностями и связанными сущностями';

--

DO $$
BEGIN
ALTER TABLE "EntityNameRelatedEntity"
ADD CONSTRAINT "PK_ENTITY_NAME_RELATED_ENTITY" PRIMARY KEY(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
WHEN invalid_table_definition THEN
NULL;
END
$$;

--

-- Добавляем ограничения внешних ключей
DO $$
BEGIN
ALTER TABLE "EntityNameRelatedEntity"
        ADD CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY__ENTITY_NAME_ID" FOREIGN KEY("entityNameId") REFERENCES "EntityName"(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
END
$$;

--

DO $$
BEGIN
ALTER TABLE "EntityNameRelatedEntity"
        ADD CONSTRAINT "FK_ENTITY_NAME_RELATED_ENTITY__RELATED_ENTITY_ID" FOREIGN KEY("relatedEntityId") REFERENCES "RelatedEntity"(id);
EXCEPTION
WHEN duplicate_object THEN
NULL;
END
$$;

--

-- Добавляем уникальные ограничения для таблицы соединения
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ENTITY_NAME_RELATED_ENTITY__ENTITY_RELATED" ON "EntityNameRelatedEntity"("tenantId", "entityNameId", "relatedEntityId");

--

-- Добавляем индексы для таблицы соединения
CREATE INDEX IF NOT EXISTS "IDX_ENTITY_NAME_RELATED_ENTITY__TENANT_ID" ON "EntityNameRelatedEntity"("tenantId");
```

#### 2.2. Генерация схемы

- Используйте инструменты интроспекции базы данных для генерации схемы из существующих баз данных
- Генерируйте клиентский код после изменений схемы
- Реализуйте надлежащую конфигурацию среды для различных целевых развертываний
- **Всегда запрашивайте разрешение пользователя перед применением миграций. Если пользователь соглашается, применяйте миграции с помощью `npm run db:create-and-fill`**
- Схему Prisma вручную не описываем, она создается через prisma pull из существующей базы данных, затем дописываем в него опции для генераторов и анотации генераторов для полей и таблиц для кастомизации генерируемого кода
- CRUD операции для сущностей реализуются непосредственно в контроллерах без отдельного описания в сервисах - это не лучшая практика, но допустимо для ускорения разработки

**Пример команд генерации схемы:**

```bash
# Генерация схемы Prisma из существующей базы данных
npx prisma db pull --schema=./src/prisma/schema.prisma

# Генерация клиента Prisma
npx prisma generate --schema=./src/prisma/schema.prisma
```

## Шаблоны интернационализации

### 1. Реализация перевода

- Используйте библиотеки перевода для интернационализации
- Реализуйте функции маркеров для извлечения ключей перевода
- Создавайте отдельные файлы перевода для каждого модуля функций
- Используйте pipes и directives перевода в шаблонах
- Переводы собираются из кода в POT файлы
- POT файлы могут находиться как в приложениях, так и в библиотеках
- При запуске `npm run translates` генерируются PO и JSON файлы переводов
- Все переводы из библиотек и node_modules собираются в приложениях
- Переводы редактируются вручную в PO файлах или с помощью Poedit
- После редактирования запускается `npm run translates` для обновления JSON файлов

**Пример реализации перевода:**

```typescript
// Компонент с переводами
@Component({
  template: `
    <h1>{{ 'feature.title' | transloco }}</h1>
    <p>{{ translocoService.translate('feature.description') }}</p>
  `,
})
export class FeatureComponent {
  constructor(private readonly translocoService: TranslocoService) {}
}

// Маркеры ключей перевода
import { marker } from '@jsverse/transloco-keys-manager/marker';

export class FeatureGridComponent {
  columns = {
    [FeatureScalarFieldEnum.id]: marker('feature.grid.columns.id'),
    [FeatureScalarFieldEnum.name]: marker('feature.grid.columns.name'),
  };
}
```

**Пример файлов перевода:**

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

### 2. Метки форм и столбцы сетки

- Используйте ключи перевода для всего текста, видимого пользователю
- Реализуйте надлежащие соглашения об именовании ключей
- Поддерживайте несколько языков

**Пример меток форм:**

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

## Шаблоны обработки ошибок

### 1. Ошибки на стороне сервера

- Реализуйте пользовательские классы ошибок для конкретных типов ошибок
- Используйте надлежащие коды состояния HTTP
- Включайте детали ошибок в тела ответов
- Реализуйте фильтрацию и логирование ошибок
- Используйте перечисления для кодов ошибок с описательными названиями
- Реализуйте автоматическую генерацию сообщений об ошибках на основе кодов
- Добавляйте метаданные к ошибкам для дополнительной информации

**Пример обработки ошибок на стороне сервера (реализованные решения):**

```typescript
// Пользовательские классы ошибок с автоматической генерацией сообщений
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

// SSO_ERROR_ENUM_TITLES содержит переводы для каждого кода ошибки
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

// Фильтр ошибок с логированием
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

### 2. Ошибки на стороне клиента

- Обрабатывайте ошибки валидации сервера в формах
- Отображайте понятные сообщения об ошибках для пользователей
- Реализуйте надлежащее управление состоянием ошибок
- Используйте компоненты UI для отображения ошибок

**Пример обработки ошибок на стороне клиента:**

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

// В компоненте формы
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

## Шаблоны тестирования

### 1. Модульное тестирование

- Используйте фреймворки тестирования для модульного тестирования
- Реализуйте надлежащую настройку и разборку тестов
- Используйте мокирование для внешних зависимостей
- Тестируйте как положительные, так и отрицательные сценарии

**Пример модульного тестирования:**

```typescript
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

### 2. End-to-End тестирование

- Используйте фреймворки E2E тестирования для интеграционного тестирования
- Реализуйте шаблоны объектов страниц
- Тестируйте пользовательские рабочие процессы и точки интеграции
- Используйте надлежащее управление тестовыми данными

**Пример E2E тестирования:**

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

## Шаблоны развертывания и инфраструктуры

### 1. Конфигурация среды

- Используйте переменные среды для конфигурации
- Реализуйте надлежащую проверку среды
- Используйте соглашения об именовании, специфичные для функций, для среды
- Поддерживайте несколько целевых развертываний (dev, prod и т.д.)

**Пример конфигурации среды:**

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

### 2. Docker и контейнеризация

- Используйте Docker для контейнеризации
- Реализуйте надлежащую сетевую контейнеризацию
- Используйте файлы среды для конфигурации
- Поддерживайте как конфигурации разработки, так и производства

**Пример конфигурации Docker:**

```dockerfile
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

### 3. Шаблоны CI/CD

- Реализуйте надлежащие скрипты сборки и развертывания
- Используйте инструменты управления монорепозиторием
- Реализуйте автоматическое тестирование в CI пайплайнах
- Используйте семантическое версионирование для релизов

**Пример конфигурации CI/CD:**

```yaml
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

## Шаблоны организации кода

### 1. Структура проекта

- Используйте структуру монорепозитория для нескольких приложений
- Организуйте код по модулям функций
- Разделяйте код фронтенда и бэкенда
- Реализуйте надлежащие границы библиотек

**Пример структуры проекта:**

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

### 2. Соглашения об именовании файлов

- Используйте описательные имена файлов, соответствующие именам классов/компонентов
- Используйте согласованные шаблоны именования (kebab-case для файлов, PascalCase для классов)
- Группируйте связанные файлы в соответствующие каталоги
- Используйте файлы index.ts для экспорта модулей
- Барел файлы создаются сами через запуск команды npm run make-ts-list

**Пример соглашений об именовании:**

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

### 3. Стиль кода и форматирование

- Используйте линтеры для проверки качества кода
- Реализуйте форматировщики кода для согласованного форматирования
- Следуйте передовым практикам TypeScript
- Используйте надлежащую организацию импортов

**Пример конфигурации стиля кода:**

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
```
