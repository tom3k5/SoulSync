# Security and Code Quality Guide

This document describes the comprehensive security and code quality tooling implemented for SoulSync.

## Overview

SoulSync implements automated security and code quality checks to prevent common vulnerabilities and maintain high code standards. These checks run automatically during development and in CI/CD pipelines.

## 🛡️ Security Checks

### 1. Dependency Security

**What it checks:**
- Outdated dependencies with known vulnerabilities
- Deprecated packages
- Insecure library versions
- Unpinned version ranges (with package-lock.json)

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:** Not available (requires manual dependency updates)

**Prevention:**
- Regularly run `npm audit` and `npm update`
- Review dependency updates before installing
- Use `npm ci` in CI/CD to ensure consistent installs

---

### 2. Secret Exposure Detection

**What it checks:**
- Hardcoded API keys
- Exposed credentials (passwords, tokens)
- AWS access keys
- Private keys in source code
- URLs with embedded credentials
- Bearer tokens in code

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:**
```bash
npm run security:fix
```

Replaces hardcoded secrets with `process.env.VARIABLE_NAME` references.

**Prevention:**
- Always use environment variables for secrets
- Add `.env` files to `.gitignore`
- Use the `inputSanitizer.ts` utility for API calls
- Review code before committing

**Best practices:**
```typescript
// ❌ BAD - Hardcoded secret
const apiKey = 'sk-1234567890abcdef';

// ✅ GOOD - Environment variable
const apiKey = process.env.EXPO_PUBLIC_API_KEY || '';
```

---

### 3. File and Function Size Analysis

**What it checks:**
- Files exceeding 500 lines
- Functions exceeding 100 lines
- Complex, monolithic code structures

**Limits:**
- **Maximum file size:** 500 lines (recommendation)
- **Maximum function size:** 100 lines (recommendation)

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:** Not available (requires manual refactoring)

**Prevention:**
- Break large files into smaller modules
- Extract helper functions
- Use composition over inheritance
- Follow Single Responsibility Principle

**Refactoring example:**
```typescript
// ❌ BAD - Large function (150 lines)
function processUserData(user: User) {
  // 150 lines of logic...
}

// ✅ GOOD - Split into smaller functions
function processUserData(user: User) {
  validateUser(user);
  sanitizeUserInput(user);
  saveUserToStorage(user);
  notifyUserRegistered(user);
}
```

---

### 4. Code Complexity Analysis

**What it checks:**
- Cyclomatic complexity (decision points)
- Number of function parameters
- Nested callback depth
- Deeply nested conditionals

**Limits:**
- **Maximum parameters:** 5 per function
- **Maximum complexity:** 10 decision points
- **Maximum depth:** 4 nesting levels
- **Maximum callbacks:** 3 nested levels

**How to check:**
```bash
npm run security:audit
npm run lint
```

**Auto-fix:** Not available (requires manual simplification)

**Prevention:**
- Use options objects for functions with many parameters
- Extract complex logic into helper functions
- Use early returns to reduce nesting
- Prefer async/await over nested callbacks

**Simplification example:**
```typescript
// ❌ BAD - Too many parameters
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  preferences: object
) {
  // ...
}

// ✅ GOOD - Options object
interface CreateUserOptions {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
  preferences: object;
}

function createUser(options: CreateUserOptions) {
  // ...
}
```

---

### 5. SQL Injection Detection

**What it checks:**
- String interpolation in SQL queries
- String concatenation in database operations
- Unsanitized user input in queries

**Note:** SoulSync uses AsyncStorage (client-side only), not SQL databases. This check is included for completeness and future-proofing.

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:**
```bash
npm run security:fix
```

Adds warning comments for manual review.

**Prevention:**
- Use parameterized queries (prepared statements)
- Never concatenate user input into SQL strings
- Use ORM/query builders with parameter binding

**Best practices:**
```typescript
// ❌ BAD - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// ✅ GOOD - Parameterized query
const query = db.prepare('SELECT * FROM users WHERE email = ?');
query.get(userEmail);
```

---

### 6. Unused Code Detection

**What it checks:**
- Unused imports
- Unused variables
- Dead code that's never executed

**How to check:**
```bash
npm run security:audit
npm run lint
```

**Auto-fix:**
```bash
npm run security:fix
npm run lint:fix
```

**Prevention:**
- Remove imports when refactoring
- Use ESLint with auto-fix on save
- Prefix intentionally unused vars with `_`
- Regular code reviews

**Best practices:**
```typescript
// ❌ BAD - Unused import
import { useState, useEffect, useMemo } from 'react';
// Only useState is used

// ✅ GOOD - Only import what you need
import { useState } from 'react';

// ✅ ACCEPTABLE - Intentionally unused (prefix with _)
function handleClick(_event: Event, data: Data) {
  processData(data);
}
```

---

### 7. Invisible Unicode Character Detection

**What it checks:**
- Zero-width spaces (U+200B)
- Zero-width joiners/non-joiners (U+200C, U+200D)
- Directional formatting characters (U+202A-U+202E)
- Byte Order Marks (U+FEFF)
- Other invisible characters that can hide malicious code

**Where it checks:**
- All source files (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`.json`, `.md`)
- Claude Code AI rules files (`.claude/`)

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:**
```bash
npm run security:fix
```

Automatically removes all invisible unicode characters.

**Why this matters:**
Invisible characters can be used to:
- Hide malicious code in plain sight
- Bypass code reviews
- Create logic that appears different than it actually is
- Manipulate string comparisons

**Prevention:**
- Run auto-fix regularly
- Use editors that highlight invisible characters
- Review code changes carefully
- Enable pre-commit hooks

---

### 8. API Security Checks

**What it checks:**
- OpenAI API calls without input sanitization
- Missing error handling in API calls
- HTTP (non-HTTPS) API endpoints
- API keys in request bodies (should be in headers)
- Missing authentication in API client initialization

**How to check:**
```bash
npm run security:audit
```

**Auto-fix:** Partial (adds warning comments)
```bash
npm run security:fix
```

**Prevention:**
- Always use HTTPS for API calls
- Sanitize user inputs before API calls using `inputSanitizer.ts`
- Put authentication in headers, not request bodies
- Implement proper error handling with try-catch
- Use environment variables for API keys
- Implement rate limiting for user-triggered API calls

**Best practices:**

```typescript
import { sanitizeAPIInput, RateLimiter } from '@/utils/inputSanitizer';

// Rate limiting
const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

// ❌ BAD - No sanitization, no error handling
async function callOpenAI(userInput: string) {
  const response = await fetch('http://api.example.com/chat', {
    body: JSON.stringify({
      message: userInput,
      apiKey: 'sk-1234' // ❌ Key in body
    })
  });
}

// ✅ GOOD - Sanitized, HTTPS, proper auth, error handling
async function callOpenAI(userInput: string, userId: string) {
  try {
    // Rate limiting
    if (!rateLimiter.isAllowed(userId)) {
      throw new Error('Rate limit exceeded');
    }

    // Input sanitization
    const sanitizedInput = sanitizeAPIInput(userInput, {
      maxLength: 2000,
      allowNewlines: true
    });

    // Proper API call
    const response = await fetch('https://api.example.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`
      },
      body: JSON.stringify({ message: sanitizedInput })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

---

## 📊 Running Security Audits

### Full Audit

Run a comprehensive security audit across the entire codebase:

```bash
npm run security:audit
```

This generates a detailed report with:
- Total issues found
- Severity breakdown (critical, high, medium, low)
- File locations and line numbers
- Suggested fixes
- Auto-fix availability

The report is saved to `security-audit-report.json`.

### Auto-Fix

Automatically fix issues where possible:

```bash
# Apply fixes
npm run security:fix

# Preview fixes without applying (dry run)
npm run security:fix:dry
```

Auto-fix handles:
- ✅ Secret exposure (converts to env vars)
- ✅ Unused imports
- ✅ Invisible unicode characters
- ✅ SQL injection (adds warnings)
- ⚠️ Partial API security (adds warnings)

### Linting

Run ESLint for code quality and security:

```bash
# Check for issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

---

## 🔧 Continuous Integration

### Pre-Commit Hooks

Security checks run automatically before each commit:

1. Security audit
2. Linting
3. Type checking
4. Tests

If any check fails, the commit is blocked.

**Setup:**
```bash
npm run security:setup
```

**Skip hooks (not recommended):**
```bash
git commit --no-verify
```

### CI/CD Pipeline

Add to your CI/CD pipeline (e.g., GitHub Actions):

```yaml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run security:audit
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run security:audit` | Run comprehensive security audit |
| `npm run security:fix` | Auto-fix security issues |
| `npm run security:fix:dry` | Preview auto-fixes without applying |
| `npm run security:setup` | Set up pre-commit hooks |
| `npm run lint` | Run ESLint (no auto-fix) |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |

---

## 📝 Best Practices

### Development Workflow

1. **Before starting work:**
   ```bash
   npm run security:audit
   ```

2. **During development:**
   - Use the `inputSanitizer.ts` utility for user inputs
   - Follow ESLint warnings
   - Keep functions small and focused
   - Use environment variables for secrets

3. **Before committing:**
   ```bash
   npm run lint:fix
   npm run format
   npm run security:fix
   npm test
   ```

4. **Commit:**
   Pre-commit hooks will run automatically

### Code Review Checklist

- [ ] No hardcoded secrets or credentials
- [ ] User inputs are sanitized
- [ ] API calls use HTTPS
- [ ] Functions are reasonably sized (<100 lines)
- [ ] No unused imports or variables
- [ ] Proper error handling
- [ ] Type safety maintained
- [ ] Tests pass
- [ ] Security audit passes

### Security Incident Response

If a security issue is discovered:

1. **Assess severity:**
   - Critical: Exposed credentials, active vulnerability
   - High: Potential data leak, injection vulnerability
   - Medium: Code quality issues that could lead to bugs
   - Low: Minor code quality improvements

2. **Immediate actions for critical/high:**
   - Rotate exposed credentials immediately
   - Apply emergency fix
   - Review git history for credential exposure
   - Consider security advisory if user data affected

3. **Apply fixes:**
   ```bash
   npm run security:fix
   npm run lint:fix
   ```

4. **Verify:**
   ```bash
   npm run security:audit
   npm test
   ```

5. **Document:**
   - Update this document with new patterns
   - Add regression tests
   - Document in CHANGELOG

---

## 🔐 Input Sanitization Utility

SoulSync provides a comprehensive input sanitization utility at `src/utils/inputSanitizer.ts`.

### Available Functions

```typescript
import {
  sanitizeTextInput,
  sanitizeEmail,
  sanitizeHTML,
  sanitizeURL,
  sanitizeAPIInput,
  sanitizeFilePath,
  RateLimiter
} from '@/utils/inputSanitizer';
```

### Usage Examples

```typescript
// Text input
const userInput = sanitizeTextInput(rawInput, 1000); // max 1000 chars

// Email validation
const email = sanitizeEmail(userEmail); // throws on invalid

// HTML escaping (prevent XSS)
const safeHTML = sanitizeHTML(userHTML);

// URL validation
const safeURL = sanitizeURL(userURL); // only http/https allowed

// API input (OpenAI, etc.)
const apiInput = sanitizeAPIInput(userMessage, {
  maxLength: 2000,
  allowNewlines: true
});

// File path (prevent traversal)
const safePath = sanitizeFilePath(userPath, ['.jpg', '.png']);

// Rate limiting
const limiter = new RateLimiter(10, 60000); // 10 per minute
if (!limiter.isAllowed(userId)) {
  throw new Error('Rate limit exceeded');
}
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [TypeScript Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## 🆘 Support

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email security@soulsync.app (or create private security advisory)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## 📄 License

This security documentation is part of the SoulSync project.

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
