# Patterns Discussed During Development

This file contains patterns and rules that have been discussed and agreed upon during our interaction.

## 1. Documentation Language Localization

### Rule

All main documentation files should be available in Russian language.

### Implementation

- Main rule files QODER_RULES.md and QODER_RULES_BY_CODE.md have been translated to Russian
- English versions are available in files without the \_RU suffix
- Created README_RU.md file with description of documentation structure in Russian language
- Updated the main README.md with information about Russian language documentation

## 2. QODER Rules File Structure

### Rule

QODER rule files should be structured by development categories.

### Implementation

- QODER_RULES.md contains general rules by categories (backend, frontend, DB, testing, etc.)
- QODER_RULES_BY_CODE.md contains detailed patterns extracted from the project code
- Each file has a table of contents for navigation
- Rules are grouped by thematic sections

## 3. File Naming Conventions

### Rule

Translation files should have the same names as the originals, with the language suffix added.

### Implementation

- English versions: QODER_RULES.md, QODER_RULES_BY_CODE.md
- Russian versions: QODER_RULES_RU.md, QODER_RULES_BY_CODE_RU.md
- English originals are available in files without the \_RU suffix

## 4. Multilingual Support

### Rule

The project should support multilingual documentation.

### Implementation

- Created Russian versions of the main documentation files
- Original English versions are available for reference
- Added multilingual information to the main README.md

## 5. Documentation Updates

### Rule

Any changes to the project architecture or patterns should be reflected in the documentation.

### Implementation

- This PATTERNS_DISCUSSED.md file was created to record discussed patterns
- All changes to rules and patterns will be documented
- Documentation is updated when changes are made to the project architecture

## 6. Project Documentation Structure

### Rule

Project documentation should be structured and easily navigable.

### Implementation

- Main rule files are located in the project root
- Each file has a table of contents
- Links between documentation files work correctly
- Added descriptions of the content of each documentation file

## 7. Documentation Versioning

### Rule

Documentation should support versioning and preserve change history.

### Implementation

- Russian versions of files are saved with the `_RU` suffix
- English versions are available in files without suffix
- New versions of files are created for significant changes
- Change history can be tracked through the version control system

## 8. Documentation Accessibility

### Rule

Documentation should be easily accessible and understandable for all project participants.

### Implementation

- Russian language documentation is located in the main project directory
- Added links to documentation in README.md
- Created README_RU.md file with description of documentation structure
- All documentation files have clear names and structure

## 9. Working with Translations

### Rule

Translations in the project are collected automatically from the code using markers, without manual intervention in translation files.

### Implementation

- Translation keys are collected from the code into POT files (example: libs/feature/metrics-afat/src/i18n/template.pot)
- POT files can be located in both applications (examples: apps/client/src/assets/i18n/template.pot, apps/server/src/assets/i18n/getText/template.pot) and libraries (examples: libs/feature/sso/src/i18n/getText/template.pot, libs/feature/sso-afat/src/i18n/template.pot)
- When a developer manually runs `npm run translates`, then:
  1. Translations are formed in multiple languages in this project it is ru (example: libs/feature/metrics-afat/src/i18n/ru.po) and en (example: libs/feature/metrics-afat/src/i18n/en.po)
  2. JSON variants are formed for translations of different languages ru (example: libs/feature/metrics-afat/src/i18n/ru.json) and en (example: libs/feature/metrics-afat/src/i18n/en.json)
  3. All translations from libs and node modules are collected in applications (example: apps/server/src/assets/i18n/ru.vendor.json, apps/client/src/assets/i18n/en.vendor.json)
- As a result, after the above steps, translation files are created where there are only keys but no translation values, if the value was previously filled, it will remain filled
- The translation is done manually by the developer by editing the PO files or using the Poedit program
- After that, manually run `npm run translates` to generate json files and update the translation files in the applications
- Manual editing of JSON translation files is not required
- All translations are extracted automatically from the code using markers

## 10. View Mode Implementation Pattern in Table Components

### Rule

Table components should support a view mode with the ability to display a custom title instead of standard action buttons.

### Implementation

- Table components should have input parameters `viewMode` (boolean) and `title` (string)
- In view mode, action buttons (create, edit, delete) should be hidden
- In view mode, a custom title should be displayed instead of the "Create" button
- In view mode, modal windows for create/edit/delete should not open
- Example implementation can be found in components of the metrics-afat module

## 11. Consistency of Functionality Implementation Between Modules

### Rule

Similar functionality in different modules should be implemented consistently.

### Implementation

- When adding new functionality to one module, similar functionality should be added to other modules
- Implementation patterns should be consistent between modules
- Example: view mode functionality was added to the metrics-afat module and then implemented similarly in the sso-afat module
