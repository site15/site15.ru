# QODER Rules

This document contains rules and guidelines for Qoder to follow when working with this codebase.

## Table of Contents

1. [General Development Rules](#general-development-rules)
2. [Backend Development Rules](#backend-development-rules)
3. [Frontend Development Rules](#frontend-development-rules)
4. [Database Rules](#database-rules)
5. [Testing Rules](#testing-rules)
6. [Documentation Rules](#documentation-rules)
7. [Code Review Rules](#code-review-rules)
8. [Performance Rules](#performance-rules)
9. [Security Rules](#security-rules)
10. [File Structure Rules](#file-structure-rules)
11. [Additional Guidelines](#additional-guidelines)

## 1. General Development Rules

### 1.1. Code Conventions

- Use consistent naming conventions for variables, functions, and classes.
- Follow established coding patterns and best practices.
- Write clear, concise, and maintainable code.

### 1.2. Version Control

- Use feature branches for new development.
- Write clear and descriptive commit messages.
- Submit pull requests for code review before merging.

### 1.3. Code Review

- Review code for consistency with coding standards.
- Provide constructive feedback and suggestions for improvement.
- Ensure code meets quality and performance requirements.

## 2. Backend Development Rules

### 2.1. Controller Implementation

- Explicitly list fields during insertion and updating operations.
- Skip relational fields in explicit field listing and handle separately using Prisma's `connect` syntax.
- Use conditional field assignment for optional fields.

### 2.2. DTO Usage

- Extended DTOs should not contain fields that are automatically managed by the system.
- Use base DTOs for fields that should be explicitly provided by the user.

### 2.3. Prisma Schema and Migration

- Use descriptive names for relation fields.
- Add indexes to frequently queried fields.
- Define unique constraints for fields that should be unique.
- Set appropriate default values for fields.
- Carefully consider whether fields should be nullable.

### 2.4. Relation Handling

- Define bidirectional relations with proper naming conventions.
- Use specific field names for relations to avoid ambiguity.
- Carefully consider cascade operations for delete operations.

## 3. Frontend Development Rules

### 3.1. Grid Component Implementation

- Grid components should have input properties for relational fields.
- Use relational fields as filters in the `loadMany` method.
- Pass relational fields to form components in the `showCreateOrUpdateModal` method.
- Grid components should support view mode with custom title display instead of action buttons.

### 3.2. Form Component Implementation

- Form components should accept relational field inputs from grid components.
- Include relational fields in the data object when creating new records.

### 3.3. Date Field Handling

- Handle `createdAt` and `updatedAt` fields with timezone offset adjustment.
- Handle other date fields as regular dates without timezone adjustment.

## 4. Database Rules

### 4.1. Database Design

- Design databases with performance and scalability in mind.
- Use appropriate data types and indexing strategies.
- Ensure data integrity and consistency.

### 4.2. Data Migration

- Include data migration steps when changing data structures or types.
- Test migrations in a development environment before applying to production.
- Have rollback plans for critical migrations.

## 5. Testing Rules

### 5.1. Unit Testing

- Write unit tests for services and components.
- Properly mock dependencies in tests.
- Test edge cases and error conditions.

### 5.2. Integration Testing

- Write integration tests for complex workflows and interactions.
- Ensure tests cover all possible scenarios.

## 6. Documentation Rules

### 6.1. Code Comments

- Add inline comments for complex logic.
- Document public functions with parameter and return value descriptions.
- Document interfaces and their properties.

### 6.2. README Files

- Maintain up-to-date README files for projects and libraries.
- Provide clear setup and installation instructions.
- Include usage examples for key features.

## 7. Code Review Rules

### 7.1. Code Review Process

- Review code for consistency with coding standards.
- Provide constructive feedback and suggestions for improvement.
- Ensure code meets quality and performance requirements.

### 7.2. Pair Programming

- Encourage pair programming for complex features.
- Promote knowledge sharing and collaboration.

## 8. Performance Rules

### 8.1. Data Loading

- Implement proper pagination for large datasets.
- Use debouncing for search inputs to reduce API calls.
- Implement appropriate caching strategies.

### 8.2. Memory Management

- Always unsubscribe from observables to prevent memory leaks.
- Properly handle component lifecycle events.

## 9. Security Rules

### 9.1. Authentication and Authorization

- Implement proper role-based access control.
- Ensure proper tenant isolation in multi-tenant applications.
- Filter data based on user roles and tenant IDs.

### 9.2. Input Sanitization

- Validate all input data on both frontend and backend.
- Use parameterized queries and ORM features to prevent SQL injection.

## 10. File Structure Rules

### 10.1. File Naming

- Use consistent naming conventions for files and directories.
- Use descriptive names for files and directories.

### 10.2. File Organization

- Organize files in a logical structure that reflects the application's architecture.
- Separate different concerns into different files and directories.

## 11. Additional Guidelines

### 11.1. Code Analysis Rules

For a comprehensive set of development patterns extracted directly from the codebase, please refer to [QODER_RULES_BY_CODE.md](./QODER_RULES_BY_CODE.md). This file contains rules derived from actual implementations in the project and should be used as a reference for maintaining consistency with existing patterns.

### 11.2. Technology Stack Consistency

- Maintain consistency with the existing technology stack
- Follow established patterns for new feature development
- Ensure compatibility with existing modules and services

### 11.3. Error Handling

- Implement graceful degradation for non-critical features.
- Provide appropriate feedback to users when errors occur.

### 11.4. Code Reusability

- Design components to be reusable where appropriate.
- Abstract common functionality into services.

### 11.5. Performance Considerations

- Implement lazy loading for modules and components when appropriate.
