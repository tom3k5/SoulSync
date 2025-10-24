/**
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
    '\u200B', '\u200C', '\u200D', '\u200E', '\u200F',
    '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', '\uFEFF'
  ];
  let sanitized = input;
  invisibleChars.forEach(char => {
    sanitized = sanitized.replace(new RegExp(char, 'g'), '');
  });

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    .replace(/\//g, '&#x2F;');
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
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  }

  // Remove potentially problematic sequences
  sanitized = sanitized
    .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
    .replace(/\s+/g, ' '); // Normalize whitespace

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
  if (sanitized.includes('\0')) {
    throw new Error('Invalid file path: null byte detected');
  }

  // Validate extension if provided
  if (allowedExtensions) {
    const ext = path.extname(sanitized).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Invalid file extension: ${ext}`);
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
