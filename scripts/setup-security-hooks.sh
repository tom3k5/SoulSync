#!/bin/bash

# Security Hooks Setup Script
# This script sets up pre-commit hooks and security tooling

set -e

echo "🛡️  Setting up security hooks and tooling..."

# Make scripts executable
chmod +x scripts/security-audit.ts
chmod +x scripts/security-auto-fix.ts

# Install husky if not already installed
if [ ! -d ".husky" ]; then
  echo "📦 Installing husky..."
  npx husky install
  npx husky add .husky/pre-commit
fi

# Make pre-commit hook executable
chmod +x .husky/pre-commit

echo "✅ Security hooks and tooling setup complete!"
echo ""
echo "Available commands:"
echo "  npm run security:audit     - Run comprehensive security audit"
echo "  npm run security:fix       - Auto-fix security issues"
echo "  npm run security:fix:dry   - Preview auto-fixes without applying"
echo "  npm run lint               - Run ESLint"
echo "  npm run lint:fix           - Auto-fix linting issues"
echo "  npm run format             - Format code with Prettier"
echo "  npm run type-check         - Run TypeScript type checking"
echo ""
