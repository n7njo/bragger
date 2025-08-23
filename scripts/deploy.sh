#!/bin/bash

# Bragger Production Deployment Script

set -e

echo "🚀 Deploying Bragger to production..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start all services
echo "🏗️  Building and starting all services..."
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health of services
echo "🔍 Checking service health..."

# Check database
if docker-compose exec postgres pg_isready -U bragger -d bragger > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📱 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  API Health: http://localhost:3001/health"
echo ""
echo "📊 Service Status:"
docker-compose ps