# Правила QODER по анализу кода

Этот документ содержит шаблоны разработки и правила, извлеченные из фактических реализаций кода в проекте. Эти правила должны использоваться Qoder для поддержания согласованности и следования установленным шаблонам.

## Шаблоны разработки бэкенда

### 1. Шаблоны контроллеров

#### 1.1. Структура контроллера

- Все контроллеры должны расширять базовые операции CRUD (findMany, findOne, createOne, updateOne, deleteOne)
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

#### 2.1. Использование клиента Prisma

- Внедряйте клиент Prisma с использованием токенов внедрения, специфичных для функции
- Используйте транзакции для операций, требующих атомарности
- Реализуйте надлежащую обработку ошибок и преобразование типов

**Пример использования клиента Prisma:**

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
}
```

#### 2.2. Шаблоны запросов

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
      },
```
