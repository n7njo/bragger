#!/bin/bash

# Bragger Development Setup Script

set -e

echo "🚀 Setting up Bragger development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Start development database
echo "📦 Starting development database..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Start the backend: cd backend && npm run dev"
echo "  2. Start the frontend: cd frontend && npm run dev"
echo "  3. Access the app at http://localhost:5173"
echo "  4. Access the database admin at http://localhost:8080"
echo "     - System: PostgreSQL"
echo "     - Server: postgres"
echo "     - Username: bragger"  
echo "     - Password: password"
echo "     - Database: bragger"