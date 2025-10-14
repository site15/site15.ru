<p align="center">
  <a href="https://github.com/nestjs-mod/" target="blank"><img src="https://avatars.githubusercontent.com/u/155752954?s=200&v=4" width="120" alt="NestJS-mod Logo" /></a>
</p>

  <p align="center">Boilerplate for creating a sso application on NestJS and Angular</p>

## Project Documentation

This project follows specific development rules and patterns that are described in the following files:

## Main Rule Files

1. [QODER_RULES.md](./QODER_RULES.md) - Main rules and recommendations for working with the codebase
2. [QODER_RULES_BY_CODE.md](./QODER_RULES_BY_CODE.md) - Detailed development patterns extracted from the project code
3. [PATTERNS_DISCUSSED.md](./PATTERNS_DISCUSSED.md) - Patterns discussed during development

## Rule Files Structure

### QODER_RULES.md

Contains general development rules, including:

- General development rules
- Backend development rules
- Frontend development rules
- Database rules
- Testing rules
- Documentation rules
- Code review rules
- Performance rules
- Security rules
- File structure rules
- Additional guidelines

### QODER_RULES_BY_CODE.md

Contains detailed development patterns extracted from the project code:

- Backend development patterns
- Frontend development patterns
- Database and ORM patterns
- Internationalization patterns
- Error handling patterns
- Testing patterns
- Deployment and infrastructure patterns
- Code organization patterns

### PATTERNS_DISCUSSED.md

Contains patterns and rules that have been discussed and agreed upon during our interaction:

- Documentation language localization
- QODER rule files structure
- File naming conventions
- Multilingual support
- Documentation updates
- Project documentation structure
- Documentation versioning
- Documentation accessibility
- Working with translations:
  - Translation keys are collected from the code into POT files
  - POT files can be located in both applications and libraries
  - When running `npm run translates`, PO and JSON translation files are generated
  - All translations from libs and node_modules are collected in applications
  - Translations are manually edited in PO files or using Poedit
  - After editing, `npm run translates` is run to update JSON files
- View mode implementation pattern in table components
- Consistency of functionality implementation between modules

## Usage Recommendations

When working with this project:

1. Always familiarize yourself with the rules in QODER_RULES.md
2. Study the patterns in QODER_RULES_BY_CODE.md to understand the project architecture
3. Review the discussed patterns in PATTERNS_DISCUSSED.md
4. Follow established conventions when adding new code
5. Update documentation when making changes to the architecture

## Language Support

The project supports the following languages:

- English (main documentation language)
- Russian (documentation available in files with \_RU suffix)

Russian versions are available in files with the \_RU suffix:

- [QODER_RULES_RU.md](./QODER_RULES_RU.md)
- [QODER_RULES_BY_CODE_RU.md](./QODER_RULES_BY_CODE_RU.md)
- [README_RU.md](./README_RU.md)

## Working with Translations

The translation process in the project:

- Translation keys are collected from the code into POT files (example: libs/feature/metrics-afat/src/i18n/template.pot)
- POT files can be located in both applications (examples: apps/client/src/assets/i18n/template.pot, apps/server/src/assets/i18n/getText/template.pot) and libraries (examples: libs/feature/sso/src/i18n/getText/template.pot, libs/feature/sso-afat/src/i18n/template.pot)
- When a developer manually runs `npm run translates`, then:
  1. Translations are formed in multiple languages in this project it is ru (example: libs/feature/metrics-afat/src/i18n/ru.po) and en (example: libs/feature/metrics-afat/src/i18n/en.po)
  2. JSON variants are formed for translations of different languages ru (example: libs/feature/metrics-afat/src/i18n/ru.json) and en (example: libs/feature/metrics-afat/src/i18n/en.json)
  3. All translations from libs and node_modules are collected in applications (example: apps/server/src/assets/i18n/ru.vendor.json, apps/client/src/assets/i18n/en.vendor.json)
- As a result, after the above steps, translation files are created where there are only keys but no translation values, if the value was previously filled, it will remain filled
- The translation is done manually by the developer by editing the PO files or using the Poedit program
- After that, manually run `npm run translates` to generate json files and update the translation files in the applications

## Demo

https://sso.nestjs-mod.com - live demo on Kubernetes

https://site15.vercel.app - live demo on Vercel

## Dev/Watch mode

Infrastructure is running using docker-compose, applications are launched in watch pm2 mode.

### Init

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
npm i
cp ./example.env ./.env
npm run manual:prepare
```

### Start

```sh
npm run pm2-full:dev:start
```

### Open in browser

http://localhost:4200

### Testing

```sh
npm run pm2-full:dev:test:e2e
```

### Stop

```sh
npm run pm2-full:dev:stop
```

## Prod mode

Infrastructure is running using docker-compose, built applications are launched using pm2.

### Init

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
npm i
cp ./example.env ./.env
npm run manual:prepare
```

### Start

```sh
npm run pm2-full:prod:start
```

### Open in browser

http://localhost:3000

### Testing

```sh
npm run pm2-full:prod:test:e2e
```

### Stop

```sh
npm run pm2-full:prod:stop
```

## Docker-compose prod mode

Infrastructure and applications built into Docker images are run using docker-compose.

### Init

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
npm i
cp ./example.env ./.env
npm run manual:prepare
```

### Start

```sh
npm run docker-compose-full:prod:start
```

### Open in browser

http://localhost:8080

### Testing

```sh
npm run docker-compose-full:prod:test:e2e
```

### Stop

```sh
npm run docker-compose-full:prod:stop
```

## Supabase Dev/Watch mode

Infrastructure is running on [Supabase](https://supabase.com/), applications are launched in watch pm2 mode.

### Init

```sh
git clone git@github.com:site15/site15.ru.git
cd site15.ru
npm i
cp ./example-supabase.env ./.env
```

### Prepare

1. Create organization and project on [Supabase](https://supabase.com/)
2. Create bucket "images" in storage (example link: https://supabase.com/dashboard/project/XXX/storage/buckets)
3. Create new "S3 Access Keys" with "Access key ID" and "Secret access key" (example link: https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage)
4. Open `.env` and fill empty_value's

   ```sh
   # https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project URL - URL
   SUPABASE_URL=empty_value
   # https://supabase.com/dashboard/project/XXX/settings/database?showConnect=true - Connection String - Direct connection
   POSTGRES_URL=empty_value
   # https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project API Keys - anon public
   SUPABASE_ANON_KEY=empty_value
   # https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Access key ID
   SITE_15_MINIO_ACCESS_KEY=empty_value
   # https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Secret access key
   SITE_15_MINIO_SECRET_KEY=empty_value
   ```

5. Create and fill all need new env keys

   ```sh
   npx --yes tsx update-files-for-vercel.ts
   ```

### Start

```sh
npm run pm2-supabase-full:dev:start
```

### Open in browser

http://localhost:4200

### Testing

```sh
npm run pm2-supabase-full:dev:test:e2e
```

### Stop

```sh
npm run pm2-supabase-full:dev:stop
```

## Links

- https://sso.nestjs-mod.com - live demo on Kubernetes
- https://site15.vercel.app - live demo on Vercel
- https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
- https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
- https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
- https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
- https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
- https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
- https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS

## Questions

For questions and support please use the official [Telegram group](https://t.me/nestjs_mod). The issue list of this repo is **exclusively** for bug reports and feature requests.

## Stay in touch

- Author - [Ilshat Khamitov](https://t.me/KaufmanEndy)

## License

[MIT licensed](LICENSE).
