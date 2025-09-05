#!/bin/bash

echo "Setting up PrepStats files..."

# Create .env.example
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://username:password@localhost:5432/prepstats"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-32-chars-minimum"
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.next/
.vercel
*.log
.DS_Store
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  }
}
module.exports = nextConfig
EOF

echo "✅ Basic configuration files created!"
echo "📝 Now manually copy the implementation code into each file from the artifacts."
echo "🚀 After that, run: cp .env.example .env and edit with your values"

