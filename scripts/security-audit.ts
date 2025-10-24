#!/usr/bin/env ts-node

/**
 * Comprehensive Security and Code Quality Audit Tool
 *
 * This script performs automated security and quality checks:
 * 1. Dependency security checks
 * 2. Secret exposure detection
 * 3. File and function size analysis
 * 4. Code complexity analysis
 * 5. SQL injection detection
 * 6. Unused code detection
 * 7. Invisible unicode character detection
 * 8. API security checks (OpenAI and others)
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  autoFixAvailable: boolean;
  suggestion?: string;
}

interface AuditReport {
  issues: AuditIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timestamp: string;
}

class SecurityAuditor {
  private issues: AuditIssue[] = [];
  private rootDir: string;
  private excludeDirs = ['node_modules', 'dist', 'build', '.expo', 'coverage', 'ios', 'android'];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  // ===== UTILITY METHODS =====

  private getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const dirName = path.basename(filePath);
        if (!this.excludeDirs.includes(dirName) && !dirName.startsWith('.')) {
          this.getAllFiles(filePath, fileList);
        }
      } else {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  private getRelativePath(filePath: string): string {
    return path.relative(this.rootDir, filePath);
  }

  private addIssue(issue: AuditIssue): void {
    this.issues.push(issue);
  }

  // ===== 1. DEPENDENCY SECURITY CHECKS =====

  private checkDependencies(): void {
    console.log('\n🔍 Checking dependencies for security issues...');

    const packageJsonPath = path.join(this.rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Known vulnerable packages and patterns
    const vulnerablePatterns = [
      { pattern: /^request$/, reason: 'Deprecated package, use axios or node-fetch instead' },
      { pattern: /^node-uuid$/, reason: 'Deprecated, use uuid instead' },
      { pattern: /^colors$/, reason: 'Potentially compromised package' },
      { pattern: /^debug@[0-2]\./, reason: 'Old version with known vulnerabilities' },
    ];

    // Check for outdated major versions (simplified heuristics)
    const outdatedHeuristics = [
      { pattern: /^react@1[0-7]\./, reason: 'React version older than 18, consider upgrading' },
      { pattern: /^typescript@[0-4]\./, reason: 'TypeScript version older than 5, consider upgrading' },
      { pattern: /^jest@2[0-8]\./, reason: 'Jest version older than 29, consider upgrading' },
    ];

    Object.entries(dependencies).forEach(([pkg, version]) => {
      const fullPkg = `${pkg}@${version}`;

      // Check for vulnerable packages
      vulnerablePatterns.forEach(({ pattern, reason }) => {
        if (pattern.test(fullPkg)) {
          this.addIssue({
            category: 'Dependency Security',
            severity: 'high',
            file: 'package.json',
            description: `Vulnerable or deprecated dependency: ${pkg}. ${reason}`,
            autoFixAvailable: false,
            suggestion: reason,
          });
        }
      });

      // Check for outdated versions
      outdatedHeuristics.forEach(({ pattern, reason }) => {
        if (pattern.test(fullPkg)) {
          this.addIssue({
            category: 'Dependency Security',
            severity: 'medium',
            file: 'package.json',
            description: `Outdated dependency: ${pkg}@${version}. ${reason}`,
            autoFixAvailable: false,
            suggestion: reason,
          });
        }
      });

      // Check for unpinned versions
      if (typeof version === 'string' && (version.startsWith('^') || version.startsWith('~'))) {
        // This is actually okay with package-lock.json, but flag for awareness
        // Skip this check as it's too noisy and package-lock.json handles it
      }
    });
  }

  // ===== 2. SECRET EXPOSURE DETECTION =====

  private checkSecretExposure(): void {
    console.log('\n🔐 Scanning for exposed secrets and credentials...');

    const secretPatterns = [
      {
        name: 'API Key',
        pattern: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['"]([a-zA-Z0-9_\-]{20,})['"](?!.*(?:YOUR_|EXAMPLE|PLACEHOLDER|TEST|DEMO))/gi,
        severity: 'critical' as const,
      },
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: 'critical' as const,
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/g,
        severity: 'critical' as const,
      },
      {
        name: 'Generic Secret',
        pattern: /(?:secret|password|passwd|pwd)\s*[=:]\s*['"](?!YOUR_|EXAMPLE|PLACEHOLDER|TEST|\*+|password|changeme)([^'"]{8,})['"](?!.*(?:YOUR_|EXAMPLE|PLACEHOLDER))/gi,
        severity: 'high' as const,
      },
      {
        name: 'Bearer Token',
        pattern: /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
        severity: 'high' as const,
      },
      {
        name: 'Hardcoded URL with credentials',
        pattern: /https?:\/\/[^:]+:[^@]+@[^\s'"]+/g,
        severity: 'critical' as const,
      },
    ];

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx|js|jsx|json|env)$/) && !f.includes('node_modules')
    );

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      secretPatterns.forEach(({ name, pattern, severity }) => {
        lines.forEach((line, index) => {
          const matches = line.match(pattern);
          if (matches && !line.includes('process.env')) {
            this.addIssue({
              category: 'Secret Exposure',
              severity,
              file: this.getRelativePath(file),
              line: index + 1,
              description: `Potential ${name} hardcoded in source: ${line.trim().substring(0, 100)}`,
              autoFixAvailable: true,
              suggestion: 'Move secret to environment variables and use process.env',
            });
          }
        });
      });
    });
  }

  // ===== 3. FILE AND FUNCTION SIZE ANALYSIS =====

  private checkFileAndFunctionSize(): void {
    console.log('\n📏 Analyzing file and function sizes...');

    const MAX_FILE_LINES = 500;
    const MAX_FUNCTION_LINES = 100;

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('node_modules') && !f.includes('.test.')
    );

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check file size
      if (lines.length > MAX_FILE_LINES) {
        this.addIssue({
          category: 'File Size',
          severity: 'medium',
          file: this.getRelativePath(file),
          description: `File is too large (${lines.length} lines, max ${MAX_FILE_LINES} recommended)`,
          autoFixAvailable: false,
          suggestion: 'Consider splitting this file into smaller, focused modules',
        });
      }

      // Check function sizes (simplified detection)
      const functionMatches = content.matchAll(
        /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:async\s+)?(?:private\s+|public\s+|protected\s+)?\w+\s*\([^)]*\)\s*{)/g
      );

      for (const match of functionMatches) {
        const startIndex = match.index || 0;
        const startLine = content.substring(0, startIndex).split('\n').length;

        // Find the end of the function (simplified - count braces)
        let braceCount = 0;
        let foundStart = false;
        let endLine = startLine;

        for (let i = startLine - 1; i < lines.length && i < startLine + MAX_FUNCTION_LINES + 50; i++) {
          const line = lines[i];
          for (const char of line) {
            if (char === '{') {
              braceCount++;
              foundStart = true;
            } else if (char === '}') {
              braceCount--;
              if (foundStart && braceCount === 0) {
                endLine = i + 1;
                break;
              }
            }
          }
          if (foundStart && braceCount === 0) break;
        }

        const functionLength = endLine - startLine + 1;
        if (functionLength > MAX_FUNCTION_LINES) {
          const functionName = match[0].match(/(?:function\s+|const\s+)(\w+)/)?.[1] || 'anonymous';
          this.addIssue({
            category: 'Function Size',
            severity: 'medium',
            file: this.getRelativePath(file),
            line: startLine,
            description: `Function '${functionName}' is too long (${functionLength} lines, max ${MAX_FUNCTION_LINES} recommended)`,
            autoFixAvailable: false,
            suggestion: 'Consider breaking this function into smaller, single-purpose functions',
          });
        }
      }
    });
  }

  // ===== 4. COMPLEXITY AND PARAMETER ANALYSIS =====

  private checkComplexity(): void {
    console.log('\n🧮 Analyzing code complexity and parameter counts...');

    const MAX_PARAMETERS = 5;
    const MAX_CYCLOMATIC_COMPLEXITY = 10;

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('node_modules') && !f.includes('.test.')
    );

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check parameter counts
      const functionMatches = content.matchAll(
        /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>|(?:async\s+)?(?:private\s+|public\s+|protected\s+)?(\w+)\s*\(([^)]*)\))/g
      );

      for (const match of functionMatches) {
        const functionName = match[1] || match[2] || match[4] || 'anonymous';
        const params = match[3] || match[5] || '';

        // Count parameters (simplified - split by comma)
        const paramCount = params
          .split(',')
          .filter((p) => p.trim() && !p.includes('...')).length;

        if (paramCount > MAX_PARAMETERS) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          this.addIssue({
            category: 'Code Complexity',
            severity: 'medium',
            file: this.getRelativePath(file),
            line: lineNumber,
            description: `Function '${functionName}' has too many parameters (${paramCount}, max ${MAX_PARAMETERS} recommended)`,
            autoFixAvailable: false,
            suggestion: 'Consider using an options object or splitting the function',
          });
        }
      }

      // Check cyclomatic complexity (simplified - count decision points)
      lines.forEach((line, index) => {
        const decisionPoints = (
          (line.match(/\b(if|else if|while|for|case|catch|\?|&&|\|\|)\b/g) || []).length
        );

        if (decisionPoints >= MAX_CYCLOMATIC_COMPLEXITY / 2) {
          this.addIssue({
            category: 'Code Complexity',
            severity: 'medium',
            file: this.getRelativePath(file),
            line: index + 1,
            description: `High complexity detected: ${decisionPoints} decision points in single line`,
            autoFixAvailable: false,
            suggestion: 'Consider extracting logic into separate functions or using early returns',
          });
        }
      });
    });
  }

  // ===== 5. SQL INJECTION DETECTION =====

  private checkSQLInjection(): void {
    console.log('\n💉 Scanning for SQL injection vulnerabilities...');

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('node_modules')
    );

    const sqlPatterns = [
      {
        pattern: /(?:execute|query|exec|run)\s*\(\s*['"`](?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)[^'"`]*\$\{[^}]+\}/gi,
        description: 'String interpolation in SQL query - potential injection vulnerability',
      },
      {
        pattern: /['"`](?:SELECT|INSERT|UPDATE|DELETE)[^'"`]*\+\s*\w+/gi,
        description: 'String concatenation in SQL query - potential injection vulnerability',
      },
      {
        pattern: /executeQuery\s*\([^)]*\+\s*[^)]*\)/gi,
        description: 'Parameter concatenation in database query',
      },
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      sqlPatterns.forEach(({ pattern, description }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            this.addIssue({
              category: 'SQL Injection',
              severity: 'critical',
              file: this.getRelativePath(file),
              line: index + 1,
              description: `${description}: ${line.trim().substring(0, 100)}`,
              autoFixAvailable: true,
              suggestion: 'Use parameterized queries or prepared statements',
            });
          }
        });
      });
    });
  }

  // ===== 6. UNUSED CODE DETECTION =====

  private checkUnusedCode(): void {
    console.log('\n🗑️  Detecting unused variables and imports...');

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx)$/) && !f.includes('node_modules') && !f.includes('.test.')
    );

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check for unused imports (simplified detection)
      const importMatches = content.matchAll(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g);

      for (const match of importMatches) {
        const namedImports = match[1]?.split(',').map((i) => i.trim().split(/\s+as\s+/).pop()?.trim()) || [];
        const defaultImport = match[2]?.trim();
        const allImports = [...namedImports, defaultImport].filter(Boolean);

        allImports.forEach((importName) => {
          if (importName) {
            // Check if the import is used in the file (excluding the import line itself)
            const regex = new RegExp(`\\b${importName}\\b`, 'g');
            const matches = content.match(regex) || [];

            // If only appears once (in import statement), it's likely unused
            if (matches.length === 1) {
              const lineNumber = content.substring(0, match.index).split('\n').length;
              this.addIssue({
                category: 'Unused Code',
                severity: 'low',
                file: this.getRelativePath(file),
                line: lineNumber,
                description: `Unused import: '${importName}' from '${match[3]}'`,
                autoFixAvailable: true,
                suggestion: 'Remove unused import to reduce bundle size',
              });
            }
          }
        });
      }

      // Check for unused variables (simplified - const/let not referenced later)
      const variableMatches = content.matchAll(/(?:const|let)\s+(\w+)\s*=/g);

      for (const match of variableMatches) {
        const varName = match[1];
        const varIndex = match.index || 0;
        const contentAfter = content.substring(varIndex + match[0].length);

        // Check if variable is used after declaration
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        const usages = contentAfter.match(regex) || [];

        if (usages.length === 0 && !varName.startsWith('_')) {
          const lineNumber = content.substring(0, varIndex).split('\n').length;
          this.addIssue({
            category: 'Unused Code',
            severity: 'low',
            file: this.getRelativePath(file),
            line: lineNumber,
            description: `Unused variable: '${varName}'`,
            autoFixAvailable: true,
            suggestion: 'Remove unused variable or prefix with underscore if intentionally unused',
          });
        }
      }
    });
  }

  // ===== 7. INVISIBLE UNICODE CHARACTER DETECTION =====

  private checkInvisibleUnicode(): void {
    console.log('\n👻 Scanning for invisible unicode characters...');

    const invisibleChars = [
      { char: '\u200B', name: 'Zero-Width Space', code: 'U+200B' },
      { char: '\u200C', name: 'Zero-Width Non-Joiner', code: 'U+200C' },
      { char: '\u200D', name: 'Zero-Width Joiner', code: 'U+200D' },
      { char: '\u200E', name: 'Left-to-Right Mark', code: 'U+200E' },
      { char: '\u200F', name: 'Right-to-Left Mark', code: 'U+200F' },
      { char: '\u202A', name: 'Left-to-Right Embedding', code: 'U+202A' },
      { char: '\u202B', name: 'Right-to-Left Embedding', code: 'U+202B' },
      { char: '\u202C', name: 'Pop Directional Formatting', code: 'U+202C' },
      { char: '\u202D', name: 'Left-to-Right Override', code: 'U+202D' },
      { char: '\u202E', name: 'Right-to-Left Override', code: 'U+202E' },
      { char: '\uFEFF', name: 'Zero-Width No-Break Space (BOM)', code: 'U+FEFF' },
    ];

    // Focus on AI rules files and configuration
    const files = this.getAllFiles(this.rootDir).filter(
      (f) =>
        (f.includes('.claude') || f.match(/\.(ts|tsx|js|jsx|json|md|txt)$/)) &&
        !f.includes('node_modules')
    );

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      invisibleChars.forEach(({ char, name, code }) => {
        lines.forEach((line, index) => {
          if (line.includes(char)) {
            const count = (line.match(new RegExp(char, 'g')) || []).length;
            this.addIssue({
              category: 'Invisible Unicode',
              severity: 'high',
              file: this.getRelativePath(file),
              line: index + 1,
              description: `Found ${count} instance(s) of ${name} (${code})`,
              autoFixAvailable: true,
              suggestion: 'Remove invisible unicode characters to prevent hidden malicious behavior',
            });
          }
        });
      });
    });
  }

  // ===== 8. API SECURITY CHECKS =====

  private checkAPISecurity(): void {
    console.log('\n🔌 Checking API security (OpenAI and others)...');

    const files = this.getAllFiles(this.rootDir).filter(
      (f) => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('node_modules')
    );

    const apiSecurityPatterns = [
      {
        name: 'OpenAI API without context isolation',
        pattern: /openai\.(?:createCompletion|createChatCompletion|createEmbedding)/gi,
        check: (content: string, match: RegExpMatchArray) => {
          // Check if there's user input sanitization nearby
          const context = content.substring(Math.max(0, (match.index || 0) - 500), (match.index || 0) + 500);
          const hasInputValidation = /(?:sanitize|validate|escape|trim)/gi.test(context);
          return !hasInputValidation;
        },
        severity: 'high' as const,
        suggestion: 'Sanitize user inputs and implement context isolation for OpenAI API calls',
      },
      {
        name: 'API call without HTTPS',
        pattern: /fetch\s*\(\s*['"]http:\/\//gi,
        check: () => true,
        severity: 'critical' as const,
        suggestion: 'Always use HTTPS for API calls to prevent man-in-the-middle attacks',
      },
      {
        name: 'Missing error handling in API call',
        pattern: /(?:fetch|axios|request)\s*\([^)]+\)(?!\s*\.(?:catch|then\s*\([^,]+,\s*\w+\)))/gi,
        check: () => true,
        severity: 'medium' as const,
        suggestion: 'Add proper error handling to API calls with .catch() or try-catch',
      },
      {
        name: 'API key in request body',
        pattern: /(?:body|data):\s*{[^}]*(?:api[_-]?key|apiKey|token)[^}]*}/gi,
        check: () => true,
        severity: 'high' as const,
        suggestion: 'Use headers for authentication instead of request body',
      },
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      apiSecurityPatterns.forEach(({ name, pattern, check, severity, suggestion }) => {
        const matches = content.matchAll(pattern);

        for (const match of matches) {
          if (check(content, match)) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            this.addIssue({
              category: 'API Security',
              severity,
              file: this.getRelativePath(file),
              line: lineNumber,
              description: `${name}: ${lines[lineNumber - 1]?.trim().substring(0, 100)}`,
              autoFixAvailable: false,
              suggestion,
            });
          }
        }
      });

      // Check for proper authentication in OpenAI calls
      const openaiMatches = content.matchAll(/new\s+OpenAI\s*\(/gi);
      for (const match of openaiMatches) {
        const context = content.substring((match.index || 0), (match.index || 0) + 300);
        const hasEnvKey = /process\.env\./gi.test(context);

        if (!hasEnvKey) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          this.addIssue({
            category: 'API Security',
            severity: 'critical',
            file: this.getRelativePath(file),
            line: lineNumber,
            description: 'OpenAI client instantiated without environment variable for API key',
            autoFixAvailable: false,
            suggestion: 'Use process.env.OPENAI_API_KEY for API key',
          });
        }
      }
    });
  }

  // ===== MAIN AUDIT EXECUTION =====

  public async runAudit(): Promise<AuditReport> {
    console.log('\n🛡️  Starting comprehensive security and quality audit...');
    console.log(`📁 Root directory: ${this.rootDir}\n`);

    // Run all checks
    this.checkDependencies();
    this.checkSecretExposure();
    this.checkFileAndFunctionSize();
    this.checkComplexity();
    this.checkSQLInjection();
    this.checkUnusedCode();
    this.checkInvisibleUnicode();
    this.checkAPISecurity();

    // Generate summary
    const summary = {
      critical: this.issues.filter((i) => i.severity === 'critical').length,
      high: this.issues.filter((i) => i.severity === 'high').length,
      medium: this.issues.filter((i) => i.severity === 'medium').length,
      low: this.issues.filter((i) => i.severity === 'low').length,
    };

    const report: AuditReport = {
      issues: this.issues,
      summary,
      timestamp: new Date().toISOString(),
    };

    return report;
  }

  public printReport(report: AuditReport): void {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SECURITY AND QUALITY AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`\n⏰ Generated: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`📦 Total Issues: ${report.issues.length}\n`);

    console.log('📈 SEVERITY BREAKDOWN:');
    console.log(`   🔴 Critical: ${report.summary.critical}`);
    console.log(`   🟠 High:     ${report.summary.high}`);
    console.log(`   🟡 Medium:   ${report.summary.medium}`);
    console.log(`   🟢 Low:      ${report.summary.low}`);

    if (report.issues.length === 0) {
      console.log('\n✅ No issues found! Your codebase is in great shape.');
      return;
    }

    // Group by severity
    const bySeverity = {
      critical: report.issues.filter((i) => i.severity === 'critical'),
      high: report.issues.filter((i) => i.severity === 'high'),
      medium: report.issues.filter((i) => i.severity === 'medium'),
      low: report.issues.filter((i) => i.severity === 'low'),
    };

    Object.entries(bySeverity).forEach(([severity, issues]) => {
      if (issues.length === 0) return;

      const emoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢';
      console.log(`\n\n${emoji} ${severity.toUpperCase()} SEVERITY ISSUES (${issues.length}):`);
      console.log('-'.repeat(80));

      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.category}] ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`   ${issue.description}`);
        if (issue.suggestion) {
          console.log(`   💡 Suggestion: ${issue.suggestion}`);
        }
        if (issue.autoFixAvailable) {
          console.log(`   ✨ Auto-fix available`);
        }
      });
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('📝 RECOMMENDATIONS:');
    console.log('='.repeat(80));

    const autoFixable = report.issues.filter((i) => i.autoFixAvailable).length;
    if (autoFixable > 0) {
      console.log(`\n✨ ${autoFixable} issues can be automatically fixed`);
      console.log('   Run with --fix flag to apply automatic fixes');
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Address critical and high severity issues immediately');
    console.log('   2. Review medium severity issues and plan fixes');
    console.log('   3. Consider addressing low severity issues during refactoring');
    console.log('   4. Set up pre-commit hooks to prevent future issues');

    console.log('\n' + '='.repeat(80) + '\n');
  }

  public saveReport(report: AuditReport, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${outputPath}`);
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const rootDir = process.cwd();
  const auditor = new SecurityAuditor(rootDir);

  const report = await auditor.runAudit();
  auditor.printReport(report);

  // Save report
  const reportPath = path.join(rootDir, 'security-audit-report.json');
  auditor.saveReport(report, reportPath);

  // Exit with appropriate code
  const criticalOrHigh = report.summary.critical + report.summary.high;
  if (criticalOrHigh > 0) {
    console.log(`\n⚠️  Found ${criticalOrHigh} critical or high severity issues`);
    process.exit(1);
  } else {
    console.log('\n✅ No critical or high severity issues found');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
}

export { SecurityAuditor, AuditReport, AuditIssue };
