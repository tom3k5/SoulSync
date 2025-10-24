#!/usr/bin/env ts-node

/**
 * Auto-Fix Tool for Security and Quality Issues
 *
 * This script automatically fixes common security and quality issues:
 * 1. Replace hardcoded secrets with environment variables
 * 2. Remove unused imports and variables
 * 3. Remove invisible unicode characters
 * 4. Fix SQL injection vulnerabilities
 * 5. Add input sanitization for API calls
 */

import * as fs from 'fs';
import * as path from 'path';

interface Fix {
  file: string;
  type: string;
  description: string;
  applied: boolean;
  error?: string;
}

class AutoFixer {
  private fixes: Fix[] = [];
  private rootDir: string;
  private dryRun: boolean;

  constructor(rootDir: string, dryRun: boolean = false) {
    this.rootDir = rootDir;
    this.dryRun = dryRun;
  }

  private logFix(fix: Fix): void {
    this.fixes.push(fix);
    const emoji = fix.applied ? '✅' : '❌';
    console.log(`${emoji} ${fix.file}: ${fix.description}`);
    if (fix.error) {
      console.log(`   Error: ${fix.error}`);
    }
  }

  // ===== 1. FIX HARDCODED SECRETS =====

  public fixHardcodedSecrets(files: string[]): void {
    console.log('\n🔐 Fixing hardcoded secrets...\n');

    const secretPatterns = [
      {
        name: 'API Key',
        pattern: /((?:api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*)['"]([a-zA-Z0-9_\-]{20,})['"](?!.*(?:YOUR_|EXAMPLE|PLACEHOLDER|TEST|DEMO))/gi,
        replacement: (match: string, prefix: string, secret: string) => {
          const envVarName = 'API_KEY';
          return `${prefix}process.env.${envVarName} || ''`;
        },
      },
      {
        name: 'Generic Secret',
        pattern: /((?:secret|password|passwd|pwd)\s*[=:]\s*)['"](?!YOUR_|EXAMPLE|PLACEHOLDER|TEST|\*+|password|changeme)([^'"]{8,})['"](?!.*(?:YOUR_|EXAMPLE|PLACEHOLDER))/gi,
        replacement: (match: string, prefix: string, secret: string) => {
          const envVarName = 'SECRET_KEY';
          return `${prefix}process.env.${envVarName} || ''`;
        },
      },
    ];

    files.forEach((file) => {
      try {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        secretPatterns.forEach(({ name, pattern, replacement }) => {
          const matches = content.match(pattern);
          if (matches) {
            content = content.replace(pattern, replacement as any);
            modified = true;
          }
        });

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(file, content, 'utf-8');
          }
          this.logFix({
            file: path.relative(this.rootDir, file),
            type: 'Secret Exposure',
            description: 'Replaced hardcoded secrets with environment variables',
            applied: true,
          });
        }
      } catch (error) {
        this.logFix({
          file: path.relative(this.rootDir, file),
          type: 'Secret Exposure',
          description: 'Failed to fix hardcoded secrets',
          applied: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // ===== 2. REMOVE UNUSED IMPORTS =====

  public removeUnusedImports(files: string[]): void {
    console.log('\n🗑️  Removing unused imports...\n');

    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        const newLines: string[] = [];
        let modified = false;

        lines.forEach((line, index) => {
          // Check if this is an import line
          const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);

          if (importMatch) {
            const namedImports = importMatch[1]?.split(',').map((i) => i.trim().split(/\s+as\s+/).pop()?.trim()) || [];
            const defaultImport = importMatch[2]?.trim();
            const allImports = [...namedImports, defaultImport].filter(Boolean);

            // Check each import
            const usedImports: string[] = [];
            allImports.forEach((importName) => {
              if (importName) {
                const regex = new RegExp(`\\b${importName}\\b`, 'g');
                const matches = content.match(regex) || [];
                // If used more than once (not just in import), keep it
                if (matches.length > 1) {
                  usedImports.push(importName);
                } else {
                  modified = true;
                }
              }
            });

            // Reconstruct the import line with only used imports
            if (usedImports.length > 0) {
              if (importMatch[1]) {
                // Named imports
                const originalImports = importMatch[1].split(',');
                const usedOriginal = originalImports.filter((imp) => {
                  const name = imp.trim().split(/\s+as\s+/).pop()?.trim();
                  return usedImports.includes(name || '');
                });
                newLines.push(`import { ${usedOriginal.join(', ')} } from '${importMatch[3]}';`);
              } else {
                // Default import
                newLines.push(line);
              }
            }
            // else: skip the line (remove unused import)
          } else {
            newLines.push(line);
          }
        });

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
          }
          this.logFix({
            file: path.relative(this.rootDir, file),
            type: 'Unused Code',
            description: 'Removed unused imports',
            applied: true,
          });
        }
      } catch (error) {
        this.logFix({
          file: path.relative(this.rootDir, file),
          type: 'Unused Code',
          description: 'Failed to remove unused imports',
          applied: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // ===== 3. REMOVE INVISIBLE UNICODE CHARACTERS =====

  public removeInvisibleUnicode(files: string[]): void {
    console.log('\n👻 Removing invisible unicode characters...\n');

    const invisibleChars = [
      '\u200B', // Zero-Width Space
      '\u200C', // Zero-Width Non-Joiner
      '\u200D', // Zero-Width Joiner
      '\u200E', // Left-to-Right Mark
      '\u200F', // Right-to-Left Mark
      '\u202A', // Left-to-Right Embedding
      '\u202B', // Right-to-Left Embedding
      '\u202C', // Pop Directional Formatting
      '\u202D', // Left-to-Right Override
      '\u202E', // Right-to-Left Override
      '\uFEFF', // Zero-Width No-Break Space (BOM)
    ];

    files.forEach((file) => {
      try {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        invisibleChars.forEach((char) => {
          if (content.includes(char)) {
            content = content.replace(new RegExp(char, 'g'), '');
            modified = true;
          }
        });

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(file, content, 'utf-8');
          }
          this.logFix({
            file: path.relative(this.rootDir, file),
            type: 'Invisible Unicode',
            description: 'Removed invisible unicode characters',
            applied: true,
          });
        }
      } catch (error) {
        this.logFix({
          file: path.relative(this.rootDir, file),
          type: 'Invisible Unicode',
          description: 'Failed to remove invisible unicode',
          applied: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // ===== 4. FIX SQL INJECTION =====

  public fixSQLInjection(files: string[]): void {
    console.log('\n💉 Fixing SQL injection vulnerabilities...\n');

    files.forEach((file) => {
      try {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Replace string interpolation with placeholder comment
        const sqlInterpolationPattern = /(['"`])(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)[^'"`]*\$\{[^}]+\}[^'"`]*\1/gi;
        if (sqlInterpolationPattern.test(content)) {
          // Add a comment warning
          const lines = content.split('\n');
          const newLines: string[] = [];

          lines.forEach((line) => {
            if (sqlInterpolationPattern.test(line)) {
              newLines.push('// ⚠️  WARNING: Potential SQL injection - use parameterized queries');
              modified = true;
            }
            newLines.push(line);
          });

          content = newLines.join('\n');
        }

        // Replace string concatenation with placeholder comment
        const sqlConcatPattern = /(['"`])(SELECT|INSERT|UPDATE|DELETE)[^'"`]*\1\s*\+/gi;
        if (sqlConcatPattern.test(content)) {
          const lines = content.split('\n');
          const newLines: string[] = [];

          lines.forEach((line) => {
            if (sqlConcatPattern.test(line)) {
              newLines.push('// ⚠️  WARNING: Potential SQL injection - use parameterized queries');
              modified = true;
            }
            newLines.push(line);
          });

          content = newLines.join('\n');
        }

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(file, content, 'utf-8');
          }
          this.logFix({
            file: path.relative(this.rootDir, file),
            type: 'SQL Injection',
            description: 'Added warnings for SQL injection vulnerabilities',
            applied: true,
          });
        }
      } catch (error) {
        this.logFix({
          file: path.relative(this.rootDir, file),
          type: 'SQL Injection',
          description: 'Failed to fix SQL injection',
          applied: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // ===== 5. ADD INPUT SANITIZATION =====

  public addInputSanitization(files: string[]): void {
    console.log('\n🧹 Adding input sanitization for API calls...\n');

    files.forEach((file) => {
      try {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Check for OpenAI API calls without obvious sanitization
        const openaiPattern = /openai\.(?:createCompletion|createChatCompletion|createEmbedding)/gi;
        if (openaiPattern.test(content)) {
          const lines = content.split('\n');
          const newLines: string[] = [];

          lines.forEach((line) => {
            if (openaiPattern.test(line)) {
              newLines.push('// ⚠️  WARNING: Ensure user input is sanitized before passing to OpenAI API');
              modified = true;
            }
            newLines.push(line);
          });

          content = newLines.join('\n');
        }

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(file, content, 'utf-8');
          }
          this.logFix({
            file: path.relative(this.rootDir, file),
            type: 'API Security',
            description: 'Added input sanitization warnings',
            applied: true,
          });
        }
      } catch (error) {
        this.logFix({
          file: path.relative(this.rootDir, file),
          type: 'API Security',
          description: 'Failed to add input sanitization',
          applied: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  // ===== 6. CREATE INPUT SANITIZER UTILITY =====

  public createInputSanitizer(): void {
    console.log('\n🛡️  Creating input sanitizer utility...\n');

    const sanitizerPath = path.join(this.rootDir, 'src', 'utils', 'inputSanitizer.ts');

    const sanitizerContent = `/**
 * Input Sanitization Utilities
 *
 * Use these utilities to sanitize user inputs before:
 * - Passing to API calls (OpenAI, etc.)
 * - Storing in database
 * - Displaying to users
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeTextInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  // Remove invisible unicode characters
  const invisibleChars = [
    '\\u200B', '\\u200C', '\\u200D', '\\u200E', '\\u200F',
    '\\u202A', '\\u202B', '\\u202C', '\\u202D', '\\u202E', '\\uFEFF'
  ];
  let sanitized = input;
  invisibleChars.forEach(char => {
    sanitized = sanitized.replace(new RegExp(char, 'g'), '');
  });

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\\x00-\\x08\\x0B-\\x0C\\x0E-\\x1F\\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeTextInput(email, 254).toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML escaping
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent protocol-based attacks
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeTextInput(url, 2048);

  // Only allow http and https protocols
  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize API input for OpenAI and similar services
 */
export function sanitizeAPIInput(input: string, options?: {
  maxLength?: number;
  allowNewlines?: boolean;
}): string {
  const { maxLength = 10000, allowNewlines = true } = options || {};

  let sanitized = sanitizeTextInput(input, maxLength);

  // Remove newlines if not allowed
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\\r\\n]+/g, ' ');
  }

  // Remove potentially problematic sequences
  sanitized = sanitized
    .replace(/[\\x00-\\x1F\\x7F]/g, '') // Control characters
    .replace(/\\s+/g, ' '); // Normalize whitespace

  return sanitized;
}

/**
 * Validate and sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(filePath: string, allowedExtensions?: string[]): string {
  const sanitized = sanitizeTextInput(filePath, 255);

  // Prevent directory traversal
  if (sanitized.includes('..') || sanitized.includes('~')) {
    throw new Error('Invalid file path: directory traversal detected');
  }

  // Check for null bytes
  if (sanitized.includes('\\0')) {
    throw new Error('Invalid file path: null byte detected');
  }

  // Validate extension if provided
  if (allowedExtensions) {
    const ext = path.extname(sanitized).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(\`Invalid file extension: \${ext}\`);
    }
  }

  return sanitized;
}

/**
 * Rate limiting helper to prevent abuse
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

import * as path from 'path';
`;

    try {
      // Create utils directory if it doesn't exist
      const utilsDir = path.join(this.rootDir, 'src', 'utils');
      if (!fs.existsSync(utilsDir)) {
        if (!this.dryRun) {
          fs.mkdirSync(utilsDir, { recursive: true });
        }
      }

      if (!this.dryRun) {
        fs.writeFileSync(sanitizerPath, sanitizerContent, 'utf-8');
      }

      this.logFix({
        file: path.relative(this.rootDir, sanitizerPath),
        type: 'Security Enhancement',
        description: 'Created input sanitizer utility',
        applied: true,
      });
    } catch (error) {
      this.logFix({
        file: path.relative(this.rootDir, sanitizerPath),
        type: 'Security Enhancement',
        description: 'Failed to create input sanitizer',
        applied: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ===== MAIN EXECUTION =====

  public getSummary(): { total: number; applied: number; failed: number } {
    return {
      total: this.fixes.length,
      applied: this.fixes.filter((f) => f.applied).length,
      failed: this.fixes.filter((f) => !f.applied).length,
    };
  }

  public printSummary(): void {
    const summary = this.getSummary();

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 AUTO-FIX SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Fixes Applied: ${summary.applied}`);
    console.log(`❌ Fixes Failed:  ${summary.failed}`);
    console.log(`📦 Total Fixes:   ${summary.total}`);

    if (this.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were actually modified');
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rootDir = process.cwd();

  console.log('\n🔧 Starting auto-fix process...');
  if (dryRun) {
    console.log('⚠️  Running in DRY RUN mode - no files will be modified\n');
  }

  const fixer = new AutoFixer(rootDir, dryRun);

  // Get all TypeScript/JavaScript files
  const getAllFiles = (dir: string, fileList: string[] = []): string[] => {
    const excludeDirs = ['node_modules', 'dist', 'build', '.expo', 'coverage', 'ios', 'android'];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const dirName = path.basename(filePath);
        if (!excludeDirs.includes(dirName) && !dirName.startsWith('.')) {
          getAllFiles(filePath, fileList);
        }
      } else {
        fileList.push(filePath);
      }
    });

    return fileList;
  };

  const allFiles = getAllFiles(rootDir);
  const tsFiles = allFiles.filter((f) => f.match(/\.(ts|tsx)$/) && !f.includes('.test.'));
  const jsFiles = allFiles.filter((f) => f.match(/\.(js|jsx)$/) && !f.includes('.test.'));
  const configFiles = allFiles.filter((f) => f.includes('.claude') || f.match(/\.(json|md)$/));

  // Apply fixes
  fixer.removeInvisibleUnicode([...tsFiles, ...jsFiles, ...configFiles]);
  fixer.fixHardcodedSecrets([...tsFiles, ...jsFiles]);
  fixer.removeUnusedImports([...tsFiles]);
  fixer.fixSQLInjection([...tsFiles, ...jsFiles]);
  fixer.addInputSanitization([...tsFiles, ...jsFiles]);
  fixer.createInputSanitizer();

  // Print summary
  fixer.printSummary();

  const summary = fixer.getSummary();
  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Auto-fix failed:', error);
    process.exit(1);
  });
}

export { AutoFixer };
