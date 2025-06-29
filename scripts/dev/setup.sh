#!/bin/bash

# CoTrain Development Environment Setup Script
# This script sets up the development environment for the CoTrain platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    print_status "Starting CoTrain development environment setup..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm first."
        print_status "You can install pnpm with: npm install -g pnpm"
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    
    # Install dependencies
    print_status "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed"
    
    # Setup environment files
    print_status "Setting up environment files..."
    
    if [ ! -f ".env" ]; then
        cp .env.template .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual configuration values"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Setup backend environment
    if [ ! -f "apps/backend/.env" ]; then
        cp .env.template apps/backend/.env
        print_success "Created backend .env file"
    else
        print_warning "Backend .env file already exists, skipping..."
    fi
    
    # Setup frontend environment
    if [ ! -f "apps/frontend/.env.local" ]; then
        # Create frontend-specific env file
        cat > apps/frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
EOF
        print_success "Created frontend .env.local file"
    else
        print_warning "Frontend .env.local file already exists, skipping..."
    fi
    
    # Build shared packages
    print_status "Building shared packages..."
    pnpm --filter "@cotrain/shared-*" build
    print_success "Shared packages built"
    
    # Setup git hooks (if husky is configured)
    if [ -f "package.json" ] && grep -q "husky" package.json; then
        print_status "Setting up git hooks..."
        pnpm husky install
        print_success "Git hooks configured"
    fi
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p logs
    mkdir -p uploads
    mkdir -p coverage
    mkdir -p .jest-cache
    print_success "Directories created"
    
    # Setup database (optional)
    read -p "Do you want to setup a local PostgreSQL database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists docker; then
            print_status "Starting PostgreSQL with Docker..."
            docker run --name cotrain-postgres -e POSTGRES_PASSWORD=cotrain -e POSTGRES_DB=cotrain -p 5432:5432 -d postgres:15
            print_success "PostgreSQL container started"
        elif command_exists psql; then
            print_status "Please create a database named 'cotrain' manually"
        else
            print_warning "Neither Docker nor PostgreSQL found. Please setup database manually"
        fi
    fi
    
    # Setup Redis (optional)
    read -p "Do you want to setup a local Redis instance? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists docker; then
            print_status "Starting Redis with Docker..."
            docker run --name cotrain-redis -p 6379:6379 -d redis:7-alpine
            print_success "Redis container started"
        elif command_exists redis-server; then
            print_status "Please start Redis manually: redis-server"
        else
            print_warning "Neither Docker nor Redis found. Please setup Redis manually"
        fi
    fi
    
    # Final instructions
    print_success "Development environment setup complete!"
    echo
    print_status "Next steps:"
    echo "  1. Edit .env files with your actual configuration"
    echo "  2. Start the development servers:"
    echo "     - Backend: pnpm dev:backend"
    echo "     - Frontend: pnpm dev:frontend"
    echo "     - All: pnpm dev"
    echo "  3. Run tests: pnpm test"
    echo "  4. Build for production: pnpm build"
    echo
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"