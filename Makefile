# =============================================================================
# CoTrain Makefile
# =============================================================================
# This Makefile provides convenient commands for development, testing, and deployment

.PHONY: help install setup dev build test clean deploy docker-up docker-down
.DEFAULT_GOAL := help

# =============================================================================
# Variables
# =============================================================================

# Project configuration
PROJECT_NAME := cotrain
NODE_VERSION := 18
PNPM_VERSION := 8

# Docker configuration
DOCKER_COMPOSE_FILE := docker-compose.yml
DOCKER_COMPOSE_DEV_FILE := docker-compose.dev.yml
DOCKER_COMPOSE_TEST_FILE := docker-compose.test.yml

# Environment configuration
ENV_FILE := .env
ENV_TEMPLATE := .env.template

# Directories
APPS_DIR := apps
PACKAGES_DIR := packages
INFRASTRUCTURE_DIR := infrastructure
LOGS_DIR := logs
UPLOADS_DIR := uploads
COVERAGE_DIR := coverage

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
NC := \033[0m # No Color

# =============================================================================
# Help
# =============================================================================

help: ## Show this help message
	@echo "$(CYAN)CoTrain Development Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup & Installation:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(install|setup|init)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(dev|start|watch)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(test|lint|format)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Building & Deployment:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(build|deploy|docker|k8s)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(clean|logs|db|backup)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# =============================================================================
# Setup & Installation
# =============================================================================

check-node: ## Check Node.js version
	@echo "$(BLUE)Checking Node.js version...$(NC)"
	@node --version | grep -E "v$(NODE_VERSION)" || (echo "$(RED)Node.js $(NODE_VERSION) is required$(NC)" && exit 1)
	@echo "$(GREEN)✓ Node.js version is compatible$(NC)"

check-pnpm: ## Check pnpm installation
	@echo "$(BLUE)Checking pnpm installation...$(NC)"
	@command -v pnpm >/dev/null 2>&1 || (echo "$(RED)pnpm is not installed. Please install it first.$(NC)" && exit 1)
	@echo "$(GREEN)✓ pnpm is installed$(NC)"

check-docker: ## Check Docker installation
	@echo "$(BLUE)Checking Docker installation...$(NC)"
	@command -v docker >/dev/null 2>&1 || (echo "$(RED)Docker is not installed. Please install it first.$(NC)" && exit 1)
	@docker --version
	@echo "$(GREEN)✓ Docker is installed$(NC)"

check-env: ## Check environment file
	@echo "$(BLUE)Checking environment configuration...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)Creating .env file from template...$(NC)"; \
		cp $(ENV_TEMPLATE) $(ENV_FILE); \
		echo "$(YELLOW)Please edit .env file with your configuration$(NC)"; \
	else \
		echo "$(GREEN)✓ .env file exists$(NC)"; \
	fi

install: check-node check-pnpm ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	pnpm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

setup: check-env install ## Complete project setup
	@echo "$(BLUE)Setting up project...$(NC)"
	pnpm run setup
	@echo "$(GREEN)✓ Project setup complete$(NC)"

init: setup ## Initialize project (alias for setup)

# =============================================================================
# Development
# =============================================================================

dev: ## Start development servers
	@echo "$(BLUE)Starting development servers...$(NC)"
	pnpm run dev

dev-frontend: ## Start only frontend development server
	@echo "$(BLUE)Starting frontend development server...$(NC)"
	pnpm run dev:frontend

dev-backend: ## Start only backend development server
	@echo "$(BLUE)Starting backend development server...$(NC)"
	pnpm run dev:backend

dev-docs: ## Start documentation development server
	@echo "$(BLUE)Starting documentation development server...$(NC)"
	pnpm run dev:docs

watch: ## Start development with file watching
	@echo "$(BLUE)Starting development with file watching...$(NC)"
	pnpm run watch

start: ## Start production servers
	@echo "$(BLUE)Starting production servers...$(NC)"
	pnpm run start

# =============================================================================
# Testing
# =============================================================================

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	pnpm run test

test-unit: ## Run unit tests
	@echo "$(BLUE)Running unit tests...$(NC)"
	pnpm run test:unit

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(NC)"
	pnpm run test:integration

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running end-to-end tests...$(NC)"
	pnpm run test:e2e

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	pnpm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	pnpm run test:coverage
	@echo "$(GREEN)Coverage report generated in $(COVERAGE_DIR)$(NC)"

lint: ## Run linting
	@echo "$(BLUE)Running linting...$(NC)"
	pnpm run lint

lint-fix: ## Run linting with auto-fix
	@echo "$(BLUE)Running linting with auto-fix...$(NC)"
	pnpm run lint:fix

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	pnpm run format

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(NC)"
	pnpm run format:check

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type checking...$(NC)"
	pnpm run type-check

# =============================================================================
# Building
# =============================================================================

build: ## Build all applications
	@echo "$(BLUE)Building all applications...$(NC)"
	pnpm run build
	@echo "$(GREEN)✓ Build complete$(NC)"

build-frontend: ## Build frontend application
	@echo "$(BLUE)Building frontend application...$(NC)"
	pnpm run build:frontend

build-backend: ## Build backend application
	@echo "$(BLUE)Building backend application...$(NC)"
	pnpm run build:backend

build-docs: ## Build documentation
	@echo "$(BLUE)Building documentation...$(NC)"
	pnpm run build:docs

build-packages: ## Build shared packages
	@echo "$(BLUE)Building shared packages...$(NC)"
	pnpm run build:packages

# =============================================================================
# Docker Commands
# =============================================================================

docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-up: check-docker ## Start Docker services
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Docker services started$(NC)"

docker-down: ## Stop Docker services
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

docker-dev-up: check-docker ## Start development Docker services
	@echo "$(BLUE)Starting development Docker services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_DEV_FILE) up -d
	@echo "$(GREEN)✓ Development Docker services started$(NC)"

docker-dev-down: ## Stop development Docker services
	@echo "$(BLUE)Stopping development Docker services...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_DEV_FILE) down
	@echo "$(GREEN)✓ Development Docker services stopped$(NC)"

docker-logs: ## Show Docker logs
	@echo "$(BLUE)Showing Docker logs...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

docker-ps: ## Show running Docker containers
	@echo "$(BLUE)Showing running Docker containers...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) ps

docker-restart: docker-down docker-up ## Restart Docker services

docker-clean: ## Clean Docker resources
	@echo "$(BLUE)Cleaning Docker resources...$(NC)"
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✓ Docker resources cleaned$(NC)"

# =============================================================================
# Database Commands
# =============================================================================

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	pnpm run db:migrate
	@echo "$(GREEN)✓ Database migrations complete$(NC)"

db-seed: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(NC)"
	pnpm run db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-reset: ## Reset database
	@echo "$(BLUE)Resetting database...$(NC)"
	pnpm run db:reset
	@echo "$(GREEN)✓ Database reset$(NC)"

db-backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	@timestamp=$$(date +"%Y%m%d_%H%M%S"); \
	docker-compose exec postgres pg_dump -U cotrain cotrain > backups/backup_$$timestamp.sql
	@echo "$(GREEN)✓ Database backup created$(NC)"

db-restore: ## Restore database from backup (usage: make db-restore BACKUP_FILE=backup_file.sql)
	@echo "$(BLUE)Restoring database from backup...$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Please specify BACKUP_FILE=filename$(NC)"; \
		exit 1; \
	fi
	docker-compose exec -T postgres psql -U cotrain -d cotrain < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

# =============================================================================
# Blockchain Commands
# =============================================================================

aptos-init: ## Initialize Aptos development environment
	@echo "$(BLUE)Initializing Aptos development environment...$(NC)"
	cd blockchain && aptos init --network testnet
	@echo "$(GREEN)✓ Aptos environment initialized$(NC)"

aptos-compile: ## Compile Aptos Move contracts
	@echo "$(BLUE)Compiling Aptos Move contracts...$(NC)"
	cd blockchain && aptos move compile
	@echo "$(GREEN)✓ Move contracts compiled$(NC)"

aptos-test: ## Test Aptos Move contracts
	@echo "$(BLUE)Testing Aptos Move contracts...$(NC)"
	cd blockchain && aptos move test
	@echo "$(GREEN)✓ Move contracts tested$(NC)"

aptos-publish: ## Publish Aptos Move contracts
	@echo "$(BLUE)Publishing Aptos Move contracts...$(NC)"
	cd blockchain && aptos move publish
	@echo "$(GREEN)✓ Move contracts published$(NC)"

aptos-faucet: ## Request tokens from Aptos faucet
	@echo "$(BLUE)Requesting tokens from Aptos faucet...$(NC)"
	cd blockchain && aptos account fund-with-faucet --account default
	@echo "$(GREEN)✓ Tokens received from faucet$(NC)"

# =============================================================================
# Deployment Commands
# =============================================================================

deploy-staging: ## Deploy to staging environment
	@echo "$(BLUE)Deploying to staging environment...$(NC)"
	@echo "$(YELLOW)This will deploy to staging. Continue? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	pnpm run deploy:staging
	@echo "$(GREEN)✓ Deployed to staging$(NC)"

deploy-production: ## Deploy to production environment
	@echo "$(BLUE)Deploying to production environment...$(NC)"
	@echo "$(RED)This will deploy to PRODUCTION. Are you sure? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	pnpm run deploy:production
	@echo "$(GREEN)✓ Deployed to production$(NC)"

k8s-apply: ## Apply Kubernetes configurations
	@echo "$(BLUE)Applying Kubernetes configurations...$(NC)"
	kubectl apply -f k8s/
	@echo "$(GREEN)✓ Kubernetes configurations applied$(NC)"

k8s-delete: ## Delete Kubernetes resources
	@echo "$(BLUE)Deleting Kubernetes resources...$(NC)"
	kubectl delete -f k8s/
	@echo "$(GREEN)✓ Kubernetes resources deleted$(NC)"

# =============================================================================
# Monitoring & Logs
# =============================================================================

logs: ## Show application logs
	@echo "$(BLUE)Showing application logs...$(NC)"
	tail -f $(LOGS_DIR)/*.log

logs-frontend: ## Show frontend logs
	@echo "$(BLUE)Showing frontend logs...$(NC)"
	docker-compose logs -f frontend

logs-backend: ## Show backend logs
	@echo "$(BLUE)Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-db: ## Show database logs
	@echo "$(BLUE)Showing database logs...$(NC)"
	docker-compose logs -f postgres

monitor: ## Open monitoring dashboard
	@echo "$(BLUE)Opening monitoring dashboard...$(NC)"
	@echo "Grafana: http://localhost:3003"
	@echo "Prometheus: http://localhost:9090"
	@echo "Jaeger: http://localhost:16686"
	@echo "Kibana: http://localhost:5601"

health: ## Check service health
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -f http://localhost:3000/api/health || echo "$(RED)Frontend health check failed$(NC)"
	@curl -f http://localhost:3001/health || echo "$(RED)Backend health check failed$(NC)"
	@echo "$(GREEN)✓ Health checks complete$(NC)"

# =============================================================================
# Utilities
# =============================================================================

clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)Cleaning build artifacts and dependencies...$(NC)"
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf apps/*/build
	rm -rf $(COVERAGE_DIR)
	pnpm store prune
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-logs: ## Clean log files
	@echo "$(BLUE)Cleaning log files...$(NC)"
	rm -rf $(LOGS_DIR)/*.log
	@echo "$(GREEN)✓ Log files cleaned$(NC)"

clean-uploads: ## Clean uploaded files
	@echo "$(BLUE)Cleaning uploaded files...$(NC)"
	rm -rf $(UPLOADS_DIR)/*
	@echo "$(GREEN)✓ Uploaded files cleaned$(NC)"

reset: clean setup ## Reset project to clean state
	@echo "$(GREEN)✓ Project reset complete$(NC)"

update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	pnpm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

security-audit: ## Run security audit
	@echo "$(BLUE)Running security audit...$(NC)"
	pnpm audit
	@echo "$(GREEN)✓ Security audit complete$(NC)"

info: ## Show project information
	@echo "$(CYAN)CoTrain Project Information$(NC)"
	@echo "Project: $(PROJECT_NAME)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "pnpm: $(PNPM_VERSION)"
	@echo "Environment: $$(cat .env | grep NODE_ENV | cut -d'=' -f2)"
	@echo "Services:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:3001"
	@echo "  Docs: http://localhost:3002"
	@echo "  Grafana: http://localhost:3003"
	@echo "  Database: localhost:5432"
	@echo "  Redis: localhost:6379"

# =============================================================================
# Git Hooks
# =============================================================================

pre-commit: lint format-check type-check test-unit ## Run pre-commit checks
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

pre-push: test build ## Run pre-push checks
	@echo "$(GREEN)✓ Pre-push checks passed$(NC)"

# =============================================================================
# Release
# =============================================================================

release-patch: ## Create patch release
	@echo "$(BLUE)Creating patch release...$(NC)"
	pnpm run release:patch

release-minor: ## Create minor release
	@echo "$(BLUE)Creating minor release...$(NC)"
	pnpm run release:minor

release-major: ## Create major release
	@echo "$(BLUE)Creating major release...$(NC)"
	pnpm run release:major

# =============================================================================
# Development Shortcuts
# =============================================================================

full-reset: docker-down clean docker-clean setup docker-up ## Complete project reset
	@echo "$(GREEN)✓ Full project reset complete$(NC)"

quick-start: check-env docker-up ## Quick start for development
	@echo "$(GREEN)✓ Quick start complete$(NC)"

dev-setup: setup docker-dev-up ## Setup development environment
	@echo "$(GREEN)✓ Development environment ready$(NC)"