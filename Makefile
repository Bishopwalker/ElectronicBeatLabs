.PHONY: help build up down logs shell test clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images
	docker-compose -f docker-compose.yml build

build-dev: ## Build development Docker images
	docker-compose -f docker-compose.dev.yml build

up: ## Start production containers
	docker-compose up -d

up-dev: ## Start development backend
	docker-compose -f docker-compose.dev.yml up -d

down: ## Stop all containers
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## View container logs
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

shell-backend: ## Shell into backend container
	docker-compose exec backend /bin/sh

test-backend: ## Run backend tests
	docker-compose exec backend pytest

test-frontend: ## Run frontend tests
	npm run test:ci

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

dev: ## Start full development environment
	@echo "Starting backend with Docker..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Starting frontend with Vite..."
	npm run dev

dev-full: ## Start dev with PostgreSQL and Redis
	docker-compose -f docker-compose.dev.yml --profile with-postgres --profile with-redis up -d
	npm run dev

restart: ## Restart all containers
	docker-compose restart

rebuild: ## Rebuild and restart containers
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

ps: ## Show container status
	docker-compose ps
