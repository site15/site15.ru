# Development Pattern: Correct Code Insertions in Documentation

## Overview

This pattern defines the standard approach for inserting code blocks in documentation files to ensure proper rendering and syntax highlighting.

## Pattern Rules

### 1. Code Block Syntax

Always use triple backticks (```) for code blocks, never single (`) or double (``) backticks.

**Correct:**

````markdown
```typescript
const example = 'correct';
```
````

````

**Incorrect:**
```markdown
``typescript
const example = 'incorrect';
``

`typescript
const example = 'incorrect';
`
````

### 2. Language Specification

Always specify the language for syntax highlighting when applicable:

````markdown
```typescript
// TypeScript code
```
````

```javascript
// JavaScript code
```

```sql
-- SQL code
```

```bash
# Bash/Shell commands
```

```json
{
  "key": "value"
}
```

```prisma
model User {
  id String @id
}
```

````

### 3. Inline Code

Use single backticks for inline code references:

```markdown
Use the `UserService` class to manage users.
````

### 4. Indentation and Formatting

Maintain consistent indentation within code blocks:

````markdown
```typescript
// Correct indentation
function example() {
  if (condition) {
    return true;
  }
  return false;
}
```
````

````

## Implementation Guidelines

### 1. When Creating Documentation

1. Always use triple backticks for code blocks
2. Specify the appropriate language identifier
3. Ensure proper indentation within code blocks
4. Validate markdown rendering before committing

### 2. When Updating Documentation

1. Review existing code blocks for correct syntax
2. Replace any double or single backticks with triple backticks
3. Ensure language identifiers are present
4. Check that code examples are properly formatted

### 3. Common Mistakes to Avoid

1. **Mixing backtick counts:**
   ```markdown
   // DON'T DO THIS
   ``typescript
   code here
   ``
````

2. **Missing language identifiers:**

   ```markdown
   // DON'T DO THIS
   ```

   code here

   ```

   ```

3. **Inconsistent indentation:**

   ````markdown
   // DON'T DO THIS

   ```typescript
   function bad() {
     return 'indentation';
   }
   ```
   ````

   ```

   ```

## Validation Process

### 1. Automated Checks

- Use linters to detect incorrect backtick usage
- Implement CI checks for documentation files
- Validate markdown syntax in pull requests

### 2. Manual Review

- Preview documentation before merging
- Check code block rendering in target platform
- Verify syntax highlighting works correctly

## Example Implementations

### Correct TypeScript Code Block

````markdown
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findUser(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}
```
````

````

### Correct SQL Code Block

```markdown
```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
````

````

### Correct Bash Command Block

```markdown
```bash
npm install
npm run build
npm start
````

```

## Benefits

1. **Consistent Rendering:** All code blocks display correctly across platforms
2. **Syntax Highlighting:** Code is properly highlighted for better readability
3. **Maintainability:** Standardized format makes updates easier
4. **Professional Appearance:** Documentation looks polished and professional

## Related Patterns

- [Documentation Structure Pattern](./documentation-structure.md)
- [Code Example Pattern](./code-examples.md)
- [API Documentation Pattern](./api-documentation.md)
```
