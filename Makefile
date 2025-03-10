.PHONY: all build clean run run-server run-mcp run-all migrate migrate-up migrate-down new-migration sqlc test test-go test-py install-tools frontend-install frontend-build frontend-dev frontend-test frontend-lint frontend-clean frontend-watch frontend-storybook lint release deploy help

# Default target executed when no arguments are given to make
all: help

# Variables
BINARY_NAME=prompts-server
MCP_BINARY_NAME=prompts-mcp
BINARY_DIR=./bin
MIGRATION_NAME?=migration
SERVER_PORT?=8080
MCP_PORT?=8081
FRONTEND_PORT?=3000

# Build binaries
build: build-server build-mcp

build-server:
	@echo "Building server binary..."
	go build -o $(BINARY_DIR)/$(BINARY_NAME) ./cmd/server

# Clean build artifacts
clean:
	@echo "Cleaning up..."
	rm -rf $(BINARY_DIR)
	rm -rf ./frontend/build
	rm -rf ./dist

# Run server
run-server:
	@echo "Running server on port $(SERVER_PORT)..."
	go run ./cmd/server/main.go

# Run MCP server
run-mcp:
	@echo "Running MCP server on port $(MCP_PORT)..."
	cd python_mcp && python mcp_server.py --port $(MCP_PORT)

# Run Python MCP server (alias)
run-py-mcp: run-mcp

# Run both servers
run-all:
	@echo "Running all servers..."
	$(MAKE) run-server & $(MAKE) run-mcp

# Database migrations
migrate-up:
	@echo "Running migrations up..."
	cd db/migration && goose sqlite3 "$(shell go run ./tools/dbpath.go)" up

migrate-down:
	@echo "Running migrations down..."
	cd db/migration && goose sqlite3 "$(shell go run ./tools/dbpath.go)" down

migrate: migrate-up

# Create a new migration
new-migration:
	@echo "Creating new migration: $(MIGRATION_NAME)..."
	cd db/migration && goose sqlite3 create $(MIGRATION_NAME) sql

# Generate SQLC code
sqlc:
	@echo "Generating SQLC code..."
	sqlc generate

# Run tests
test: test-go test-py

test-go:
	@echo "Running Go tests..."
	go test -v ./...

test-py:
	@echo "Running Python tests..."
	cd python_mcp && python -m pytest

# Install required tools
install-tools:
	@echo "Installing required tools..."
	go install github.com/kyleconroy/sqlc/cmd/sqlc@latest
	go install github.com/pressly/goose/v3/cmd/goose@latest
	pip install -r python_mcp/requirements.txt

# Frontend commands
frontend-install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

frontend-build:
	@echo "Building frontend for production..."
	cd frontend && npm run build

frontend-dev:
	@echo "Starting frontend development server on port $(FRONTEND_PORT)..."
	cd frontend && PORT=$(FRONTEND_PORT) npm start

frontend-test:
	@echo "Running frontend tests..."
	cd frontend && npm test

frontend-lint:
	@echo "Linting frontend code..."
	cd frontend && npm run lint

frontend-clean:
	@echo "Cleaning frontend build artifacts..."
	rm -rf frontend/build frontend/node_modules/.cache

frontend-watch:
	@echo "Starting frontend in watch mode..."
	cd frontend && npm run watch

frontend-storybook:
	@echo "Starting Storybook development server..."
	cd frontend && npm run storybook

# Code quality
lint: frontend-lint
	@echo "Linting code..."
	go vet ./...
	cd python_mcp && python -m flake8

# Release with goreleaser
release:
	@echo "Creating release with goreleaser..."
	goreleaser release --snapshot --clean

# Deploy to Fly.io
deploy:
	@echo "Deploying to Fly.io..."
	fly deploy

# Setup directory structure
setup-dirs:
	@echo "Setting up directory structure..."
	mkdir -p $(BINARY_DIR) data

# Help message
help:
	@echo "KitchenAI Prompts Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  build              - Build server and MCP binaries"
	@echo "  build-server       - Build only the server binary"
	@echo "  build-mcp         - Build only the MCP binary"
	@echo "  clean             - Remove build artifacts"
	@echo "  run-server        - Run the API server"
	@echo "  run-mcp           - Run the Python MCP server"
	@echo "  run-all           - Run both the API server and MCP server"
	@echo "  migrate           - Run database migrations up"
	@echo "  migrate-up        - Run database migrations up"
	@echo "  migrate-down      - Rollback database migrations"
	@echo "  new-migration     - Create a new migration file"
	@echo "  sqlc              - Generate SQLC code"
	@echo "  test              - Run all tests"
	@echo "  test-go           - Run Go tests"
	@echo "  test-py           - Run Python tests"
	@echo "  install-tools     - Install required tools"
	@echo "  frontend-install  - Install frontend dependencies"
	@echo "  frontend-build    - Build frontend for production"
	@echo "  frontend-dev      - Run frontend development server"
	@echo "  frontend-test     - Run frontend tests"
	@echo "  frontend-lint     - Lint frontend code"
	@echo "  frontend-clean    - Clean frontend build artifacts"
	@echo "  frontend-watch    - Start frontend in watch mode"
	@echo "  frontend-storybook - Start Storybook development server"
	@echo "  lint              - Run all linters"
	@echo "  release           - Create release with goreleaser"
	@echo "  deploy            - Deploy to Fly.io"
	@echo "  setup-dirs        - Setup directory structure"
	@echo ""
	@echo "Variables:"
	@echo "  MIGRATION_NAME    - Name for new migration (default: 'migration')"
	@echo "  SERVER_PORT       - Port for API server (default: 8080)"
	@echo "  MCP_PORT         - Port for MCP server (default: 8081)"
	@echo "  FRONTEND_PORT    - Port for frontend dev server (default: 3000)" 