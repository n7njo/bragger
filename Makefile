# Bragger Kubernetes Development Makefile
PROJECT_NAME := bragger
NAMESPACE := bragger
CLUSTER_NAME := bragger-dev
BACKEND_PORT := 30001
FRONTEND_PORT := 30000
ADMINER_PORT := 30002

.PHONY: help dev build deploy clean logs shell status cluster-start cluster-stop cluster-delete restart health

help:
	@echo "Bragger Kubernetes Development Commands:"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev             - Start development mode with Skaffold (auto-reload)"
	@echo "  make build           - Build and import Docker images"
	@echo "  make deploy          - Deploy to Kubernetes cluster"
	@echo "  make restart         - Restart all deployments"
	@echo ""
	@echo "🔍 Monitoring & Debug:"
	@echo "  make status          - Show cluster and deployment status"
	@echo "  make logs            - Show backend application logs"
	@echo "  make logs-frontend   - Show frontend application logs"
	@echo "  make logs-postgres   - Show PostgreSQL logs"
	@echo "  make shell           - Open shell in backend pod"
	@echo "  make shell-postgres  - Open shell in PostgreSQL pod"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean           - Remove deployment (keep cluster)"
	@echo "  make cluster-stop    - Stop k3d cluster (preserve data)"
	@echo "  make cluster-delete  - Delete k3d cluster (remove all data)"
	@echo ""
	@echo "🏗️  Cluster Management:"
	@echo "  make cluster-start   - Start k3d cluster"
	@echo "  make cluster-info    - Show cluster information"
	@echo ""
	@echo "🩺 Health & Testing:"
	@echo "  make health          - Test all health endpoints"
	@echo "  make health-backend  - Test backend API health"
	@echo "  make health-frontend - Test frontend health"
	@echo ""
	@echo "📊 Access URLs:"
	@echo "  Frontend:    http://localhost:$(FRONTEND_PORT)"
	@echo "  Backend API: http://localhost:$(BACKEND_PORT)"
	@echo "  Adminer:     http://localhost:$(ADMINER_PORT)"

dev:
	@echo "🚀 Starting Skaffold development mode..."
	skaffold dev --port-forward

build:
	@echo "🏗️  Building Docker images..."
	docker build -t bragger-backend:latest ./backend
	docker build -t bragger-frontend:latest ./frontend
	@echo "📦 Importing images to k3d cluster..."
	k3d image import bragger-backend:latest -c $(CLUSTER_NAME)
	k3d image import bragger-frontend:latest -c $(CLUSTER_NAME)
	@echo "✅ Build completed!"

deploy:
	@echo "🚀 Deploying to Kubernetes cluster..."
	kubectl apply -k k8s/overlays/development/
	@echo "⏳ Waiting for deployments to be ready..."
	kubectl wait --for=condition=ready pod -l app=$(PROJECT_NAME) -n $(NAMESPACE) --timeout=300s || true
	@echo "✅ Deployment completed!"
	@make status

clean:
	@echo "🧹 Cleaning up deployment..."
	kubectl delete -k k8s/overlays/development/ || true
	@echo "✅ Cleanup completed!"

logs:
	@echo "📋 Showing backend logs (Ctrl+C to exit)..."
	kubectl logs -f deployment/backend -n $(NAMESPACE)

logs-frontend:
	@echo "📋 Showing frontend logs (Ctrl+C to exit)..."
	kubectl logs -f deployment/frontend -n $(NAMESPACE)

logs-postgres:
	@echo "📋 Showing PostgreSQL logs (Ctrl+C to exit)..."
	kubectl logs -f statefulset/postgres -n $(NAMESPACE)

shell:
	@echo "🐚 Opening shell in backend pod..."
	kubectl exec -it deployment/backend -n $(NAMESPACE) -- /bin/sh

shell-postgres:
	@echo "🐚 Opening PostgreSQL shell..."
	kubectl exec -it statefulset/postgres -n $(NAMESPACE) -- psql -U bragger -d bragger

status:
	@echo "=== 📊 Cluster Information ==="
	kubectl cluster-info
	@echo ""
	@echo "=== 🏷️  $(PROJECT_NAME) Resources ==="
	kubectl get all -n $(NAMESPACE) || echo "No resources found in $(NAMESPACE) namespace"
	@echo ""
	@echo "=== 💾 Persistent Volumes ==="
	kubectl get pvc -n $(NAMESPACE) || echo "No PVCs found"
	@echo ""
	@echo "=== 📡 Access URLs ==="
	@echo "Frontend:    http://localhost:$(FRONTEND_PORT)"
	@echo "Backend API: http://localhost:$(BACKEND_PORT)/health"
	@echo "Adminer:     http://localhost:$(ADMINER_PORT)"

cluster-start:
	@echo "🏗️  Creating k3d cluster: $(CLUSTER_NAME)"
	k3d cluster create $(CLUSTER_NAME) \
		--port "$(FRONTEND_PORT):$(FRONTEND_PORT)@server:0" \
		--port "$(BACKEND_PORT):$(BACKEND_PORT)@server:0" \
		--port "$(ADMINER_PORT):$(ADMINER_PORT)@server:0" \
		--agents 1 \
		--k3s-arg "--disable=traefik@server:0" || echo "Cluster may already exist"
	@echo "⏳ Waiting for cluster to be ready..."
	kubectl wait --for=condition=ready nodes --all --timeout=60s
	@echo "✅ Cluster ready!"

cluster-stop:
	@echo "⏸️  Stopping k3d cluster: $(CLUSTER_NAME)"
	k3d cluster stop $(CLUSTER_NAME)

cluster-delete:
	@echo "🗑️  Deleting k3d cluster: $(CLUSTER_NAME)"
	k3d cluster delete $(CLUSTER_NAME)

cluster-info:
	@echo "=== 🏗️  Cluster Information ==="
	k3d cluster list
	kubectl config current-context
	kubectl version --short || kubectl version

restart:
	@echo "🔄 Restarting all deployments..."
	kubectl rollout restart deployment/backend -n $(NAMESPACE)
	kubectl rollout restart deployment/frontend -n $(NAMESPACE)
	kubectl rollout restart deployment/adminer -n $(NAMESPACE) || true
	kubectl rollout restart deployment/redis -n $(NAMESPACE) || true
	@echo "⏳ Waiting for rollouts to complete..."
	kubectl rollout status deployment/backend -n $(NAMESPACE)
	kubectl rollout status deployment/frontend -n $(NAMESPACE)
	@echo "✅ Restart completed!"

health:
	@echo "🩺 Testing all health endpoints..."
	@make health-frontend
	@make health-backend

health-backend:
	@echo "🔍 Testing backend health..."
	@curl -f -s http://localhost:$(BACKEND_PORT)/health | jq . || echo "❌ Backend health check failed"

health-frontend:
	@echo "🔍 Testing frontend health..."
	@curl -f -s -o /dev/null -w "%{http_code}" http://localhost:$(FRONTEND_PORT) | grep -q "200" && echo "✅ Frontend healthy" || echo "❌ Frontend health check failed"

# Quick shortcuts
up: cluster-start build deploy
down: clean cluster-stop
reset: cluster-delete cluster-start build deploy

# Development workflow helpers
quick-deploy: build deploy
watch-logs: logs
db-shell: shell-postgres