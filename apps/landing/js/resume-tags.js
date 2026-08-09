// Interactive Tag Cloud for Resume Page
(function () {
  const TAG_DATA = [
    {
      name: 'Node.js',
      size: 3,
      color: 'neo-green',
      items: [
        { text: 'Основной язык backend-разработки на протяжении 6+ лет', exp: 'exp-nda' },
        { text: 'AI-платформа Aimilo: fullstack разработка на Node.js/NestJS', exp: 'exp-aimilo' },
        { text: 'Миграция legacy JavaScript/Express на TypeScript/NestJS (500+ endpoints)', exp: 'exp-ilink' },
        { text: 'Разработка платформенных библиотек и обёрток', exp: 'exp-rvision' },
        { text: 'Оптимизация production backend: увеличение нагрузки в ~350×', exp: 'exp-joyvoo' },
        { text: 'Криптовалютная биржа ТУТУ.ТВ: backend на микросервисной архитектуре', exp: 'exp-tutu' },
        {
          text: 'Экосистема NestJS-mod: архитектурные соглашения и библиотеки для крупных систем',
          url: '/#projects',
          target: 'proj-3',
          type: 'опенсорс',
        },
        {
          text: 'Rucken: fullstack-платформа на TypeScript для ускорения разработки',
          url: '/projects/rucken.html',
          type: 'опенсорс',
        },
      ],
    },
    {
      name: 'TypeScript',
      size: 3,
      color: 'neo-blue',
      items: [
        { text: 'Типобезопасная разработка backend и frontend во всех проектах', exp: 'exp-nda' },
        { text: 'AI-платформа Aimilo: типобезопасная fullstack-разработка', exp: 'exp-aimilo' },
        { text: 'Миграция legacy JavaScript-кода на TypeScript с сохранением совместимости', exp: 'exp-ilink' },
        {
          text: 'Перевод части работы с БД с TypeORM на Prisma — обнаружение и исправление проблем благодаря типобезопасности',
          exp: 'exp-joyvoo',
        },
        { text: 'Игровая платформа: modular monolith, code generation, E2E-тесты', exp: 'exp-gaming' },
      ],
    },
    {
      name: 'NestJS',
      size: 3,
      color: 'neo-pink',
      items: [
        {
          text: 'Администратор русскоязычных сообществ NestJS RU, NestJS Basic, NestJS Random, NestJS Jobs',
          url: '/#open-source-community',
          target: 'open-source-community',
          type: 'сообщество',
        },
        { text: 'Основной фреймворк для backend-сервисов на протяжении 4+ лет', exp: 'exp-nda' },
        { text: 'AI-платформа Aimilo: backend на NestJS с AI-интеграциями', exp: 'exp-aimilo' },
        { text: 'Поэтапная миграция legacy-системы на архитектуру NestJS', exp: 'exp-ilink' },
        { text: 'Разработка внутренних NestJS-библиотек для 5 команд компании', exp: 'exp-rvision' },
        {
          text: 'Криптовалютная биржа: dependency injection, мультипровайдинг, модульная архитектура',
          exp: 'exp-tutu',
        },
        {
          text: 'NestJS-mod: экосистема библиотек и архитектурных соглашений',
          url: '/projects/nestjs-mod.html',
          type: 'опенсорс',
        },
        {
          text: 'class-validator-multi-lang: многоязычные сообщения об ошибках',
          url: '/projects/class-validator-multi-lang.html',
          type: 'опенсорс',
        },
      ],
    },
    {
      name: 'PostgreSQL',
      size: 3,
      color: 'neo-blue',
      items: [
        {
          text: 'Организация работы через отдельные схемы/БД-доступы, ~150 таблиц, ~90 справочников',
          exp: 'exp-gaming',
        },
        { text: 'AI-платформа Aimilo: PostgreSQL + Prisma ORM', exp: 'exp-aimilo' },
        {
          text: 'Оптимизация транзакций, блокировок, connection pool и индексов — увеличение нагрузки в ~350×',
          exp: 'exp-joyvoo',
        },
        { text: 'Миграции БД, воспроизводимый deployment-процесс', exp: 'exp-ilink' },
        { text: 'Криптовалютная биржа: проектирование и оптимизация структуры БД', exp: 'exp-tutu' },
        { text: 'Сложная бизнес-логика в хранимых процедурах (Oracle PL/SQL)', exp: 'exp-komtek' },
        { text: 'Ранний опыт: ЦТМ — PHP/PostgreSQL для нефтяных организаций', exp: 'exp-ctm' },
        {
          text: 'RAG-система: PostgreSQL + pgvector для векторного поиска',
          url: '/projects/rag-system.html',
          type: 'опенсорс',
        },
      ],
    },
    {
      name: 'Angular',
      size: 2,
      color: 'neo-red',
      items: [
        {
          text: 'Администратор русскоязычного сообщества Angular Universal RU',
          url: '/#open-source-community',
          target: 'open-source-community',
          type: 'сообщество',
        },
        { text: 'Полная разработка административной панели с аналитическими запросами', exp: 'exp-joyvoo' },
        { text: 'AI-платформа Aimilo: административная панель на Angular', exp: 'exp-aimilo' },
        { text: 'Разработка клиентских приложений для веб-платформ (беттинг, донаты, скидки)', exp: 'exp-highload' },
        { text: 'Игровая платформа: веб-сайт, административная панель, desktop-приложение', exp: 'exp-gaming' },
        { text: 'Криптовалютная биржа: frontend на Angular, dependency injection и мультипровайдинг', exp: 'exp-tutu' },
        { text: 'Разработка frontend-модулей веб-сервиса подбора персонала', exp: 'exp-pomogatel' },
        { text: 'Разработка frontend для медицинских информационных систем', exp: 'exp-komtek' },
        { text: 'Ранний опыт: фриланс — backend на Django, frontend на Angular', exp: 'exp-freelance3' },
        {
          text: 'ngx-dynamic-form-builder: динамические формы с валидациями (118 звёзд)',
          url: '/projects/ngx-dynamic-form-builder.html',
          type: 'опенсорс',
        },
        {
          text: 'My Dashboard: веб + мобильное приложение на Ionic/Capacitor',
          url: '/projects/my-dashboard.html',
          type: 'проект',
        },
      ],
    },
    {
      name: 'Docker',
      size: 2,
      color: 'neo-blue',
      items: [
        { text: 'Внедрение Docker/Kubernetes и автоматического CI/CD с нуля', exp: 'exp-joyvoo' },
        { text: 'AI-платформа Aimilo: контейнеризация и инфраструктура', exp: 'exp-aimilo' },
        { text: 'Организация 7 окружений, автоматический deployment 3 компонентов', exp: 'exp-gaming' },
        { text: 'Построение CI/CD и Kubernetes-инфраструктуры для blockchain-сервисов', exp: 'exp-ilink' },
        { text: 'Криптовалютная биржа ТУТУ.ТВ: Docker + Kubernetes + GitLab CI/CD', exp: 'exp-tutu' },
        { text: 'Веб-платформы: инфраструктура в Kubernetes с автоматизированным деплоем', exp: 'exp-highload' },
      ],
    },
    {
      name: 'Kubernetes',
      size: 2,
      color: 'neo-purple',
      items: [
        { text: 'Выстраивание CI/CD и deployment-процесса с 7 окружениями', exp: 'exp-gaming' },
        { text: 'AI-платформа Aimilo: инфраструктура в Docker/Kubernetes', exp: 'exp-aimilo' },
        { text: 'Построение Kubernetes-инфраструктуры с нуля для blockchain-сервисов', exp: 'exp-ilink' },
        { text: 'Внедрение контейнеризации и автоматического деплоя', exp: 'exp-joyvoo' },
        { text: 'Криптовалютная биржа ТУТУ.ТВ: Kubernetes + GitLab CI/CD', exp: 'exp-tutu' },
        { text: 'Веб-платформы: деплой в Kubernetes, CI/CD через GitLab', exp: 'exp-highload' },
      ],
    },
    {
      name: 'GraphQL',
      size: 2,
      color: 'neo-pink',
      items: [
        { text: 'Проектирование и реализация GraphQL API для клиентских приложений', exp: 'exp-nda' },
        { text: 'Единый GraphQL Gateway для микросервисной архитектуры', exp: 'exp-nda' },
        { text: 'Игровая платформа: GraphQL API для веб и desktop', exp: 'exp-gaming' },
        { text: 'Разработка API на GraphQL для веб-платформ', exp: 'exp-highload' },
        { text: 'Проверка работы библиотек в GraphQL-сценариях', exp: 'exp-rvision' },
      ],
    },
    {
      name: 'Prisma',
      size: 2,
      color: 'neo-green',
      items: [
        {
          text: 'Администратор русскоязычного сообщества Prisma RU',
          url: '/#open-source-community',
          target: 'open-source-community',
          type: 'сообщество',
        },
        { text: 'AI-платформа Aimilo: PostgreSQL + Prisma ORM', exp: 'exp-aimilo' },
        { text: 'Конфиденциальный проект: PostgreSQL + Prisma ORM, автоматические миграции', exp: 'exp-nda' },
        { text: 'Перевод части работы с БД с TypeORM на Prisma, обнаружение и исправление проблем', exp: 'exp-joyvoo' },
        { text: 'Внедрение Prisma для типобезопасной работы с базой данных', exp: 'exp-ilink' },
      ],
    },
    {
      name: 'NATS JetStream',
      size: 2,
      color: 'neo-yellow',
      items: [
        { text: 'Потоковая обработка blockchain-данных через NATS JetStream и микросервисы', exp: 'exp-ilink' },
        { text: 'AI-платформа Aimilo: взаимодействие подсистем через NATS JetStream', exp: 'exp-aimilo' },
        { text: 'Конфиденциальный проект: NATS JetStream для межсервисного взаимодействия', exp: 'exp-nda' },
      ],
    },
    {
      name: 'E2E-тесты',
      size: 2,
      color: 'neo-green',
      items: [
        { text: '~800 E2E-тестов для технических и бизнес-сценариев', exp: 'exp-gaming' },
        { text: '~15 000 E2E test cases для проверки поведения API', exp: 'exp-ilink' },
        { text: '100 параллельных полных прогонов E2E-тестов', exp: 'exp-ilink' },
        { text: 'Нагрузочные и E2E-тесты для проверки стабильности backend', exp: 'exp-joyvoo' },
        { text: 'Веб-платформы: покрытие системы e2e тестами', exp: 'exp-highload' },
      ],
    },
    {
      name: 'CI/CD',
      size: 2,
      color: 'neo-purple',
      items: [
        { text: 'С нуля выстроил CI/CD на базе GitLab CI/CD, 7 окружений, ~7 минут deployment', exp: 'exp-gaming' },
        { text: 'AI-платформа Aimilo: настройка инфраструктуры и deployment', exp: 'exp-aimilo' },
        { text: 'Внедрение Docker/Kubernetes и автоматического CI/CD', exp: 'exp-joyvoo' },
        { text: 'Автоматический deployment через GitLab CI/CD', exp: 'exp-tutu' },
        { text: 'Отдельные pipeline для blockchain-сервисов', exp: 'exp-ilink' },
        { text: 'Веб-платформы: CI/CD через GitLab в Kubernetes', exp: 'exp-highload' },
      ],
    },
    {
      name: 'WebSockets',
      size: 2,
      color: 'neo-blue',
      items: [
        { text: 'Реализация большого количества real-time сценариев через WebSockets', exp: 'exp-highload' },
        { text: 'Real-time функциональность для мобильной игры', exp: 'exp-joyvoo' },
      ],
    },
    {
      name: 'Redis',
      size: 2,
      color: 'neo-red',
      items: [
        { text: 'Redis для кэширования в микросервисной архитектуре', exp: 'exp-nda' },
        { text: 'Игровая платформа: Redis для кэширования в modular monolith', exp: 'exp-gaming' },
        {
          text: 'Рефакторинг избыточного Redis-кэширования, устранение проблем, которые кэш маскировал',
          exp: 'exp-joyvoo',
        },
      ],
    },
    {
      name: 'Next.js',
      size: 2,
      color: 'neo-black',
      items: [{ text: 'Разработка клиентского сайта и административной панели на Next.js', exp: 'exp-nda' }],
    },
    {
      name: 'gRPC',
      size: 2,
      color: 'neo-purple',
      items: [
        { text: 'Микросервисная архитектура с взаимодействием сервисов через gRPC', exp: 'exp-nda' },
        { text: 'Проверка работы библиотек в gRPC-сценариях', exp: 'exp-rvision' },
      ],
    },
    {
      name: 'OpenTelemetry',
      size: 1,
      color: 'neo-green',
      items: [
        {
          text: 'Разработка и тестирование интеграций с OpenTelemetry для платформенных компонентов',
          exp: 'exp-rvision',
        },
        { text: 'Observability через Prometheus, Grafana и OpenTelemetry с correlation ID', exp: 'exp-ilink' },
      ],
    },
    {
      name: 'Kafka',
      size: 1,
      color: 'neo-yellow',
      items: [{ text: 'Разработка и тестирование Kafka-обёрток для платформенных компонентов', exp: 'exp-rvision' }],
    },
    {
      name: 'ClickHouse',
      size: 1,
      color: 'neo-yellow',
      items: [{ text: 'Внедрение ClickHouse для аналитики и обработки данных, система миграций', exp: 'exp-tutu' }],
    },
    {
      name: 'MySQL',
      size: 1,
      color: 'neo-blue',
      items: [{ text: 'Оптимизация MySQL под высокую конкурентную нагрузку мобильной игры', exp: 'exp-joyvoo' }],
    },
    {
      name: 'Oracle',
      size: 1,
      color: 'neo-red',
      items: [
        { text: 'Проектирование структуры БД Oracle, сложная бизнес-логика в PL/SQL', exp: 'exp-komtek' },
        { text: 'Хранимые процедуры, SQL-запросы, миграции для бухгалтерских систем', exp: 'exp-parus' },
        { text: 'Разработка модулей для банковской системы Finacle, миграции БД', exp: 'exp-uralsib' },
        { text: 'Администрирование БД и резервное копирование серверной инфраструктуры', exp: 'exp-rosreestr' },
        { text: 'Модули корпоративной информационной системы, unit-тесты', exp: 'exp-argument' },
        { text: 'Инструменты генерации отчётов, анализ структуры БД', exp: 'exp-varyegan' },
      ],
    },
    {
      name: 'Electron',
      size: 1,
      color: 'neo-purple',
      items: [{ text: 'Разработка desktop-приложения для управления сетью игровых клубов', exp: 'exp-gaming' }],
    },
    {
      name: 'RxJS',
      size: 1,
      color: 'neo-pink',
      items: [{ text: 'Real-time функциональность через WebSockets и RxJS', exp: 'exp-highload' }],
    },
    {
      name: 'Flyway',
      size: 1,
      color: 'neo-green',
      items: [
        { text: 'Внедрение системы миграций базы данных (Flyway)', exp: 'exp-komtek' },
        { text: 'Миграции БД и воспроизводимый deployment-процесс', exp: 'exp-ilink' },
      ],
    },
    {
      name: 'Nx',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'Администратор русскоязычного сообщества NX Dev RU',
          url: '/#open-source-community',
          target: 'open-source-community',
          type: 'сообщество',
        },
        { text: 'Внедрение monorepo-архитектуры на базе Nx', exp: 'exp-ilink' },
        {
          text: 'Rucken: NX Monorepo с CLI, schematics и fullstack-демонстрациями',
          url: '/projects/rucken.html',
          type: 'опенсорс',
        },
      ],
    },
    {
      name: 'Code Generation',
      size: 1,
      color: 'neo-pink',
      items: [
        { text: 'Code generation для типовых CRUD-модулей, генерация за ~5 минут', exp: 'exp-gaming' },
        { text: 'Кодогенерация на основе схемы БД для backend и frontend (JHipster)', exp: 'exp-komtek' },
        { text: 'Собственная утилита генерации frontend-кода rucken.ru', exp: 'exp-komtek' },
      ],
    },
    {
      name: 'AI / RAG',
      size: 2,
      color: 'neo-pink',
      items: [
        {
          text: 'RAG-система на NestJS + PostgreSQL (pgvector): гибридная архитектура с точным и семантическим поиском',
          url: '/projects/rag-system.html',
          type: 'опенсорс',
        },
        { text: 'AI-бот на базе RAG для автоматической обработки обращений с базой знаний Zendesk', exp: 'exp-nda' },
        { text: 'Разработка коммерческой AI-платформы для генерации медиаконтента', exp: 'exp-aimilo' },
      ],
    },
    {
      name: 'Modular Monolith',
      size: 1,
      color: 'neo-green',
      items: [
        { text: 'Modular monolith с изолированными модулями и возможностью выделения сервисов', exp: 'exp-gaming' },
      ],
    },
    {
      name: 'Blockchain',
      size: 1,
      color: 'neo-yellow',
      items: [
        {
          text: 'Криптовалютная платёжная платформа: BTC, DOGE, ETH, TRON — архитектура из 7 сервисов',
          exp: 'exp-ilink',
        },
        { text: 'Электронная биржа криптовалют с собственной блокчейн-инфраструктурой', exp: 'exp-tutu' },
      ],
    },
    {
      name: 'SOLID',
      size: 1,
      color: 'neo-blue',
      items: [{ text: 'Применение принципов SOLID при проектировании архитектуры', exp: 'exp-nda' }],
    },
    {
      name: 'Prometheus',
      size: 1,
      color: 'neo-orange',
      items: [{ text: 'Observability через Prometheus, Grafana и OpenTelemetry с алертингом', exp: 'exp-ilink' }],
    },
    {
      name: 'Protobuf',
      size: 1,
      color: 'neo-purple',
      items: [{ text: 'Использование Protobuf для сериализации данных в микросервисной архитектуре', exp: 'exp-tutu' }],
    },
    {
      name: 'JHipster',
      size: 1,
      color: 'neo-green',
      items: [{ text: 'Генерация backend-кода на базе JHipster для медицинских систем', exp: 'exp-komtek' }],
    },
    {
      name: 'ExtJS',
      size: 1,
      color: 'neo-red',
      items: [
        { text: 'Разработка frontend-интерфейсов на ExtJS для корпоративной информационной системы', exp: 'exp-ctm' },
      ],
    },
    {
      name: 'Delphi',
      size: 1,
      color: 'neo-purple',
      items: [
        { text: 'Разработка модулей и хранимых процедур для медицинских систем', exp: 'exp-komtek-old' },
        {
          text: 'Разработка хранимых процедур и SQL-запросов для бухгалтерских систем, администрирование БД',
          exp: 'exp-parus',
        },
        {
          text: 'Администрирование серверной инфраструктуры и разработка инструментов автоматизации',
          exp: 'exp-rosreestr',
        },
        { text: 'Разработка новых модулей корпоративной информационной системы', exp: 'exp-argument' },
        { text: 'Инструменты генерации сводных аналитических отчётов, сложные SQL-запросы', exp: 'exp-varyegan' },
      ],
    },
    {
      name: 'Java',
      size: 1,
      color: 'neo-red',
      items: [
        {
          text: 'Backend-модули на Java (Spring MVC) для медицинских систем, кодогенерация через JHipster',
          exp: 'exp-komtek',
        },
        {
          text: 'Модули для банковской системы Finacle, фреймворк генерации клиентских форм (Java + JQuery)',
          exp: 'exp-uralsib',
        },
      ],
    },
    {
      name: 'PHP',
      size: 1,
      color: 'neo-purple',
      items: [
        { text: 'Backend-модули на PHP для нефтяных организаций, PostgreSQL, ExtJS', exp: 'exp-ctm' },
        {
          text: 'Веб-приложения на PHP (Fat-Free Framework), гибридные мобильные приложения на Ionic',
          exp: 'exp-freelance2',
        },
        { text: 'Веб-сайты и приложения на PHP (CodeIgniter), кроссбраузерная вёрстка', exp: 'exp-freelance1' },
        { text: 'Веб-сайты на фриланс-биржах, PHP/JavaScript/CSS', exp: 'exp-freelance0' },
      ],
    },
    {
      name: 'Ionic',
      size: 1,
      color: 'neo-pink',
      items: [
        {
          text: 'Гибридные мобильные приложения на Ionic с синхронизацией данных (CQRS)',
          exp: 'exp-freelance2',
          type: 'опыт работы',
        },
        { text: 'Rucken: Ionic-компоненты для мобильных приложений', url: '/projects/rucken.html', type: 'опенсорс' },
        {
          text: 'My Dashboard: мобильное приложение на Ionic/Capacitor',
          url: '/projects/my-dashboard.html',
          type: 'проект',
        },
        {
          text: 'ngx-dynamic-form-builder: динамические формы с поддержкой мобильных платформ',
          url: '/projects/ngx-dynamic-form-builder.html',
          type: 'опенсорс',
        },
      ],
    },
    {
      name: 'Django',
      size: 1,
      color: 'neo-green',
      items: [{ text: 'Backend-часть приложений на Django, фриланс-проекты', exp: 'exp-freelance3' }],
    },
    // --- Projects ---
    {
      name: 'Rucken',
      size: 1,
      color: 'neo-pink',
      items: [
        {
          text: 'Инженерная платформа: backend на NestJS (JWT/OAuth/Passport.js), CLI/schematics, NX Monorepo, Angular/Ionic (508 звёзд)',
          url: '/projects/rucken.html',
        },
      ],
    },
    {
      name: 'NestJS-mod',
      size: 1,
      color: 'neo-green',
      items: [
        {
          text: 'Экосистема библиотек с формализованной моделью слоёв (Core/Feature/Integration/Infrastructure/System), 9 репозиториев, 35 звёзд',
          url: '/projects/nestjs-mod.html',
        },
      ],
    },
    {
      name: 'KaufmanBot',
      size: 1,
      color: 'neo-purple',
      items: [
        {
          text: 'Плагинная архитектура Telegram-бота с мультипровайдингом в NestJS и исследование DI через nestjs-custom-injector',
          url: '/projects/kaufmanbot.html',
        },
      ],
    },
    {
      name: 'OpWork',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'Платформа поиска работы: NestJS + Vue 3 + Prisma + PostgreSQL, трёхуровневая архитектура с кастомным генератором DTO',
          url: '/projects/opwork.html',
        },
      ],
    },
    {
      name: 'Aimilo',
      size: 1,
      color: 'neo-pink',
      items: [
        {
          text: 'AI-платформа для персонализированного медиаконтента: Production SaaS с онлайн-оплатой, антифродом и AI-конвейером',
          url: '/projects/aimilo.html',
        },
      ],
    },
    {
      name: 'My Dashboard',
      size: 1,
      color: 'neo-green',
      items: [
        {
          text: 'Fullstack система управления дашбордами: AnalogJS/Angular + Ionic/Capacitor + TRPC + Supabase, QR-привязка устройств',
          url: '/projects/my-dashboard.html',
        },
      ],
    },
    {
      name: 'nest-permissions-seed',
      size: 1,
      color: 'neo-yellow',
      items: [
        {
          text: 'Шаблон проекта на NestJS с JWT, Guards и permissions (118 звёзд)',
          url: '/projects/nest-permissions-seed.html',
        },
      ],
    },
    {
      name: 'typegraphql-prisma',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'Форк генератора typegraphql-prisma для быстрой генерации CRUD на NestJS + GraphQL',
          url: '/projects/typegraphql-prisma-nestjs.html',
        },
      ],
    },
    // --- Communities & Publications ---
    {
      name: 'Сообщества',
      size: 2,
      color: 'neo-blue',
      items: [
        {
          text: 'Администратор 8 русскоязычных IT-сообществ в Telegram',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'NestJS RU — крупнейшее русскоязычное сообщество по NestJS',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'NestJS Basic, NestJS Random — дополнительные сообщества по NestJS',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'Prisma RU — сообщество по ORM Prisma',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'TypeORM RU — сообщество по ORM TypeORM',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'NestJS Jobs — доска объявлений для NestJS-разработчиков',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'NX Dev RU — сообщество по NX Monorepo',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'Angular Universal RU — сообщество по Angular SSR',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'Kaufman Log — канал-дневник Fullstack-разработчика',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
      ],
    },
    {
      name: 'Open Source',
      size: 2,
      color: 'neo-green',
      items: [
        {
          text: 'GitHub: 97 подписчиков, 88 репозиториев, 431 звезда',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        {
          text: 'NestJS-mod: 9 репозиториев, 35 звёзд, 866 загрузок/мес на npm',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
      ],
    },
    {
      name: 'Публикации',
      size: 1,
      color: 'neo-orange',
      items: [
        {
          text: 'Dev.to — технические статьи и руководства на английском',
          url: '/#open-source-community',
          target: 'open-source-community',
        },
        { text: 'Habr — 28 статей на русском языке', url: '/#open-source-community', target: 'open-source-community' },
      ],
    },
    {
      name: 'Vue',
      size: 1,
      color: 'neo-green',
      items: [{ text: 'OpWork: платформа поиска работы на NestJS + Vue 3 + Prisma', url: '/projects/opwork.html' }],
    },
    {
      name: 'Supabase',
      size: 1,
      color: 'neo-green',
      items: [
        { text: 'My Dashboard: OAuth-авторизация и база данных через Supabase', url: '/projects/my-dashboard.html' },
      ],
    },
    {
      name: 'pgvector',
      size: 1,
      color: 'neo-yellow',
      items: [
        {
          text: 'RAG-система: векторные эмбеддинги и семантический поиск через pgvector',
          url: '/projects/rag-system.html',
        },
        { text: 'AI-бот на базе RAG: семантический поиск по базе знаний Zendesk', exp: 'exp-nda' },
      ],
    },
    {
      name: 'Telegram Bot',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'KaufmanBot: плагинная архитектура Telegram-бота с мультипровайдингом',
          url: '/projects/kaufmanbot.html',
        },
      ],
    },
    {
      name: 'NX Monorepo',
      size: 1,
      color: 'neo-purple',
      items: [
        { text: 'Rucken: NX Monorepo с CLI, schematics и fullstack-демонстрациями', url: '/projects/rucken.html' },
        { text: 'NestJS-mod: организация кодовой базы через Nx', url: '/projects/nestjs-mod.html' },
      ],
    },
    {
      name: 'JWT / OAuth',
      size: 1,
      color: 'neo-red',
      items: [
        {
          text: 'nest-permissions-seed: JWT авторизация, Guards, роли и permissions',
          url: '/projects/nest-permissions-seed.html',
          type: 'опенсорс',
        },
        {
          text: 'Rucken: система аутентификации на JWT и OAuth через Passport.js',
          url: '/projects/rucken.html',
          type: 'опенсорс',
        },
        {
          text: 'Универсальный OTP-модуль с поддержкой нескольких провайдеров и каналов доставки',
          exp: 'exp-nda',
          type: 'опыт работы',
        },
        { text: 'Сервис авторизации для криптовалютной платёжной платформы', exp: 'exp-ilink', type: 'опыт работы' },
        { text: 'Модуль двухфакторной аутентификации для криптовалютной биржи', exp: 'exp-tutu', type: 'опыт работы' },
      ],
    },
    {
      name: 'Capacitor',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'My Dashboard: мобильное приложение на Ionic/Capacitor с автоматическими сборками',
          url: '/projects/my-dashboard.html',
        },
      ],
    },
    {
      name: 'Passport.js',
      size: 1,
      color: 'neo-red',
      items: [
        {
          text: 'Rucken: система аутентификации на JWT и OAuth через Passport.js стратегии в NestJS',
          url: '/projects/rucken.html',
          type: 'опенсорс',
        },
        {
          text: 'nest-permissions-seed: JWT авторизация и Guards через Passport.js',
          url: '/projects/nest-permissions-seed.html',
          type: 'опенсорс',
        },
        { text: 'Сервис авторизации для криптовалютной платёжной платформы', exp: 'exp-ilink', type: 'опыт работы' },
      ],
    },
    {
      name: 'TRPC',
      size: 1,
      color: 'neo-purple',
      items: [
        {
          text: 'My Dashboard: type-safe API через tRPC с патчами библиотек для кастомизации fetch',
          url: '/projects/my-dashboard.html',
        },
      ],
    },
    {
      name: 'AnalogJS',
      size: 1,
      color: 'neo-red',
      items: [
        {
          text: 'My Dashboard: Angular-style фреймворк с SSR из коробки, с патчами для авторизации и кэширования',
          url: '/projects/my-dashboard.html',
        },
      ],
    },
    {
      name: 'class-validator-multi-lang',
      size: 1,
      color: 'neo-pink',
      items: [
        {
          text: 'Форк class-validator с многоязычными сообщениями об ошибках и интеграцией с Crowdin',
          url: '/projects/class-validator-multi-lang.html',
        },
        {
          text: 'ngx-dynamic-form-builder: валидация форм через class-validator-multi-lang',
          url: '/projects/ngx-dynamic-form-builder.html',
        },
      ],
    },
    {
      name: 'Dialogflow',
      size: 1,
      color: 'neo-blue',
      items: [
        {
          text: 'KaufmanBot: интеграция с Google Dialogflow для автоматических ответов',
          url: '/projects/kaufmanbot.html',
        },
      ],
    },
    {
      name: 'MS SQL',
      size: 1,
      color: 'neo-red',
      items: [{ text: 'Работа с MS SQL Server в корпоративных информационных системах', exp: 'exp-ctm' }],
    },
    {
      name: 'TypeORM',
      size: 1,
      color: 'neo-pink',
      items: [
        {
          text: 'Администратор русскоязычного сообщества TypeORM RU',
          url: '/#open-source-community',
          target: 'open-source-community',
          type: 'сообщество',
        },
        { text: 'Работа с TypeORM в проектах, миграция части работы с TypeORM на Prisma', exp: 'exp-joyvoo' },
      ],
    },
    {
      name: 'GitLab',
      size: 1,
      color: 'neo-orange',
      items: [
        { text: 'GitLab CI/CD: настройка pipeline, 7 окружений, автоматический deployment', exp: 'exp-gaming' },
        { text: 'GitLab CI/CD для blockchain-сервисов и отдельных pipeline', exp: 'exp-ilink' },
        { text: 'Криптовалютная биржа ТУТУ.ТВ: GitLab CI/CD + Kubernetes', exp: 'exp-tutu' },
        { text: 'Веб-платформы: CI/CD через GitLab в Kubernetes', exp: 'exp-highload' },
        { text: 'Joyvoo: автоматический deployment через GitLab CI/CD', exp: 'exp-joyvoo' },
        { text: 'Ранний опыт: ЦТМ — Git, GitLab CI/CD', exp: 'exp-ctm' },
      ],
    },
  ];

  const SIZE_MAP = {
    1: { min: 11, max: 13 },
    2: { min: 14, max: 17 },
    3: { min: 18, max: 22 },
  };

  const TAG_TYPE_MAP = {
    Rucken: 'проект',
    'NestJS-mod': 'проект',
    KaufmanBot: 'проект',
    OpWork: 'проект',
    Aimilo: 'проект',
    'My Dashboard': 'проект',
    'nest-permissions-seed': 'проект',
    'typegraphql-prisma': 'проект',
    'class-validator-multi-lang': 'проект',
    Сообщества: 'сообщество',
    'Open Source': 'опенсорс',
    Публикации: 'публикация',
    'Node.js': 'опыт работы',
    TypeScript: 'опыт работы',
    NestJS: 'опыт работы',
    PostgreSQL: 'опыт работы',
    Angular: 'опыт работы',
    Docker: 'опыт работы',
    Kubernetes: 'опыт работы',
    GraphQL: 'опыт работы',
    Prisma: 'опыт работы',
    'NATS JetStream': 'опыт работы',
    'E2E-тесты': 'опыт работы',
    'CI/CD': 'опыт работы',
    WebSockets: 'опыт работы',
    Redis: 'опыт работы',
    'Next.js': 'опыт работы',
    gRPC: 'опыт работы',
    OpenTelemetry: 'опыт работы',
    Kafka: 'опыт работы',
    ClickHouse: 'опыт работы',
    MySQL: 'опыт работы',
    Oracle: 'опыт работы',
    Electron: 'опыт работы',
    RxJS: 'опыт работы',
    Flyway: 'опыт работы',
    Nx: 'опыт работы',
    'Code Generation': 'опыт работы',
    'AI / RAG': 'опыт работы',
    'Modular Monolith': 'опыт работы',
    Blockchain: 'опыт работы',
    SOLID: 'опыт работы',
    Prometheus: 'опыт работы',
    Protobuf: 'опыт работы',
    JHipster: 'опыт работы',
    ExtJS: 'опыт работы',
    Delphi: 'опыт работы',
    Java: 'опыт работы',
    PHP: 'опыт работы',
    Ionic: 'опыт работы',
    Django: 'опыт работы',
    Vue: 'опыт работы',
    Supabase: 'опыт работы',
    pgvector: 'опыт работы',
    'Telegram Bot': 'опыт работы',
    'NX Monorepo': 'опыт работы',
    'JWT / OAuth': 'опыт работы',
    Capacitor: 'опыт работы',
    'Passport.js': 'опыт работы',
    TRPC: 'опыт работы',
    AnalogJS: 'опыт работы',
    Dialogflow: 'опыт работы',
    'MS SQL': 'опыт работы',
    TypeORM: 'опыт работы',
    GitLab: 'опыт работы',
  };

  function init() {
    const container = document.getElementById('tag-cloud-container');
    if (!container) return;

    // Assign types from mapping
    TAG_DATA.forEach((tag) => {
      tag.type = TAG_TYPE_MAP[tag.name] || 'опыт работы';
    });

    renderTagCloud(container);
    renderModal();
    bindEvents();
    handleHashNavigation();
  }

  function renderTagCloud(container) {
    // Sort alphabetically
    const tags = [...TAG_DATA].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    tags.forEach((tag) => {
      const sizeInfo = SIZE_MAP[tag.size];
      const fontSize = sizeInfo.min + Math.random() * (sizeInfo.max - sizeInfo.min);
      const rotation = (Math.random() - 0.5) * 6;

      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tag-cloud-item neo-border';
      el.dataset.tag = tag.name;
      el.style.fontSize = fontSize.toFixed(1) + 'px';
      el.style.transform = `rotate(${rotation.toFixed(1)}deg)`;

      // Color classes
      const bgClass = getBgClass(tag.color);
      bgClass.split(' ').forEach((c) => el.classList.add(c));

      el.textContent = tag.name + ' (' + tag.items.length + ')';
      container.appendChild(el);
    });
  }

  function getBgClass(color) {
    const map = {
      'neo-black': 'bg-neo-black text-white',
      'neo-blue': 'bg-neo-blue text-white',
      'neo-green': 'bg-neo-green text-neo-black',
      'neo-yellow': 'bg-neo-yellow text-neo-black',
      'neo-pink': 'bg-neo-pink text-neo-black',
      'neo-purple': 'bg-neo-purple text-white',
      'neo-red': 'bg-red-500 text-white',
      'neo-orange': 'bg-orange-500 text-white',
    };
    return map[color] || 'bg-white text-neo-black';
  }

  function renderModal() {
    const modal = document.getElementById('tag-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.tag-modal-overlay');
    const wrapper = modal.querySelector('.tag-modal-wrapper');

    // Close on wrapper click (outside the modal box)
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) closeModal();
    });

    // Close on overlay click
    overlay.addEventListener('click', closeModal);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Close button
    modal.querySelector('.tag-modal-close').addEventListener('click', closeModal);
  }

  function openModal(tagName) {
    const tag = TAG_DATA.find((t) => t.name === tagName);
    if (!tag) return;

    const modal = document.getElementById('tag-modal');
    const title = modal.querySelector('.tag-modal-title');
    const list = modal.querySelector('.tag-modal-list');

    title.textContent = tagName;
    list.innerHTML = '';

    tag.items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'tag-modal-item neo-border bg-white p-3 cursor-pointer hover:bg-neo-yellow transition-colors';
      li.innerHTML = `
                <div class="flex items-start gap-2">
                    <span class="font-bold text-neo-black mt-0.5">${idx + 1}.</span>
                    <div class="flex-1">
                        <p class="text-sm leading-relaxed">${item.text}</p>
                        <p class="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1">
                            <span class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-[10px] font-bold uppercase rounded">${item.type || tag.type}</span>
                            <i data-lucide="${item.url ? 'external-link' : 'arrow-down-right'}" class="w-3 h-3"></i> ${item.url ? 'перейти к странице' : 'перейти к опыту'}
                        </p>
                    </div>
                </div>
            `;
      li.addEventListener('click', () => {
        closeModal();
        setTimeout(() => navigateToItem(item), 300);
      });
      list.appendChild(li);
    });

    // Re-initialize lucide icons for the new content
    if (window.lucide) lucide.createIcons();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('tag-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function navigateToItem(item) {
    if (item.url && !item.exp) {
      // If URL already contains hash, use it as-is; otherwise append target as hash
      const finalUrl = item.url.includes('#') ? item.url : item.url + (item.target ? '#' + item.target : '');

      // Same page — just scroll
      if (window.location.pathname === new URL(finalUrl, window.location.origin).pathname) {
        const hash = finalUrl.split('#')[1];
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const card = el.closest('.project-card, .experience-card, [class*="reveal"]') || el;
            card.classList.add('experience-highlight');
            setTimeout(() => card.classList.remove('experience-highlight'), 3000);
          }
        }
        return;
      }

      // Cross-page navigation
      window.location.href = finalUrl;
      return;
    }
    if (item.exp) {
      scrollToExperience(item.exp);
    }
  }

  function scrollToExperience(expId) {
    const el = document.querySelector(`[data-experience-id="${expId}"]`);
    if (!el) return;

    // Remove previous highlights
    document.querySelectorAll('.experience-highlight').forEach((prev) => {
      prev.classList.remove('experience-highlight');
    });

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight after scroll
    setTimeout(() => {
      el.classList.add('experience-highlight');
      // Remove after animation
      setTimeout(() => {
        el.classList.remove('experience-highlight');
      }, 3000);
    }, 600);
  }

  // Handle cross-page hash navigation on page load
  function handleHashNavigation() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash) || document.querySelector(`[data-id="${hash}"]`);
    if (!el) return;

    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the element
      const card = el.closest('.project-card, .experience-card, [class*="reveal"]') || el;
      card.classList.add('experience-highlight');
      setTimeout(() => card.classList.remove('experience-highlight'), 3000);
    }, 500);
  }

  function bindEvents() {
    const container = document.getElementById('tag-cloud-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const tagEl = e.target.closest('.tag-cloud-item');
      if (!tagEl) return;
      openModal(tagEl.dataset.tag);
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
