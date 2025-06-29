#!/bin/bash

# Test Runner Script for CoTrain
# Runs tests across all packages and applications

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Test options
TEST_TYPE="all"
COVERAGE=false
WATCH=false
VERBOSE=false
PARALLEL=false
UPDATE_SNAPSHOTS=false
BAIL=false
SILENT=false
TEST_PATTERN=""
TEST_PATH=""
MAX_WORKERS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --update-snapshots)
            UPDATE_SNAPSHOTS=true
            shift
            ;;
        --bail)
            BAIL=true
            shift
            ;;
        --silent)
            SILENT=true
            shift
            ;;
        --pattern)
            TEST_PATTERN="$2"
            shift 2
            ;;
        --path)
            TEST_PATH="$2"
            shift 2
            ;;
        --max-workers)
            MAX_WORKERS="$2"
            shift 2
            ;;
        --help|-h)
            echo "CoTrain Test Runner"
            echo
            echo "Usage: $0 [options]"
            echo
            echo "Test Types:"
            echo "  all             Run all tests (default)"
            echo "  unit            Run unit tests only"
            echo "  integration     Run integration tests only"
            echo "  e2e             Run end-to-end tests only"
            echo "  backend         Run backend tests only"
            echo "  frontend        Run frontend tests only"
            echo "  packages        Run shared package tests only"
            echo
            echo "Options:"
            echo "  --type <type>           Test type to run"
            echo "  --coverage              Generate coverage report"
            echo "  --watch                 Watch mode for development"
            echo "  --verbose               Show detailed output"
            echo "  --parallel              Run tests in parallel"
            echo "  --update-snapshots      Update Jest snapshots"
            echo "  --bail                  Stop on first test failure"
            echo "  --silent                Suppress output"
            echo "  --pattern <pattern>     Test name pattern to match"
            echo "  --path <path>           Specific test file or directory"
            echo "  --max-workers <num>     Maximum number of worker processes"
            echo "  --help, -h              Show this help message"
            echo
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 --type unit --coverage             # Unit tests with coverage"
            echo "  $0 --type frontend --watch            # Frontend tests in watch mode"
            echo "  $0 --pattern "user" --verbose         # Tests matching 'user' pattern"
            echo "  $0 --path apps/backend/src/auth       # Tests in specific directory"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate test type
case "$TEST_TYPE" in
    all|unit|integration|e2e|backend|frontend|packages)
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        print_status "Available types: all, unit, integration, e2e, backend, frontend, packages"
        exit 1
        ;;
esac

# Check if pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
    print_error "pnpm is required but not installed"
    print_status "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Change to root directory
cd "$ROOT_DIR"

print_status "Running CoTrain tests..."
print_status "Test type: $TEST_TYPE"
print_status "Root directory: $ROOT_DIR"

# Set test environment
export NODE_ENV=test
export CI=${CI:-false}

# Build Jest arguments
build_jest_args() {
    local args=()
    
    if [ "$COVERAGE" = true ]; then
        args+=("--coverage")
    fi
    
    if [ "$WATCH" = true ]; then
        args+=("--watch")
    fi
    
    if [ "$VERBOSE" = true ]; then
        args+=("--verbose")
    fi
    
    if [ "$UPDATE_SNAPSHOTS" = true ]; then
        args+=("--updateSnapshot")
    fi
    
    if [ "$BAIL" = true ]; then
        args+=("--bail")
    fi
    
    if [ "$SILENT" = true ]; then
        args+=("--silent")
    fi
    
    if [ -n "$TEST_PATTERN" ]; then
        args+=("--testNamePattern=$TEST_PATTERN")
    fi
    
    if [ -n "$MAX_WORKERS" ]; then
        args+=("--maxWorkers=$MAX_WORKERS")
    elif [ "$PARALLEL" = true ]; then
        args+=("--maxWorkers=50%")
    fi
    
    if [ -n "$TEST_PATH" ]; then
        args+=("$TEST_PATH")
    fi
    
    echo "${args[@]}"
}

# Setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install --frozen-lockfile
    fi
    
    # Build shared packages if needed
    if [ ! -d "packages/shared-types/dist" ] || [ ! -d "packages/shared-utils/dist" ] || [ ! -d "packages/shared-config/dist" ]; then
        print_status "Building shared packages..."
        pnpm --filter "@cotrain/shared-*" build
    fi
    
    # Start test databases if needed
    if [ "$TEST_TYPE" = "all" ] || [ "$TEST_TYPE" = "integration" ] || [ "$TEST_TYPE" = "backend" ]; then
        if command -v docker >/dev/null 2>&1; then
            print_status "Starting test database..."
            
            # Check if test database script exists
            if [ -f "scripts/dev/db-manage.sh" ]; then
                bash "scripts/dev/db-manage.sh" start >/dev/null 2>&1 || true
                sleep 2
                bash "scripts/dev/db-manage.sh" create cotrain_test >/dev/null 2>&1 || true
            fi
        fi
    fi
    
    print_success "Test environment ready"
}

# Run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    local jest_args=($(build_jest_args))
    jest_args+=("--testPathPattern=.*\\.(test|spec)\\.(js|ts|tsx)$")
    jest_args+=("--testPathIgnorePatterns=/e2e/,/integration/")
    
    pnpm jest "${jest_args[@]}"
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    local jest_args=($(build_jest_args))
    jest_args+=("--testPathPattern=.*integration.*\\.(test|spec)\\.(js|ts|tsx)$")
    
    pnpm jest "${jest_args[@]}"
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    # Check if Playwright is available
    if command -v playwright >/dev/null 2>&1 || [ -f "node_modules/.bin/playwright" ]; then
        print_status "Running Playwright E2E tests..."
        
        # Start development servers if needed
        if [ "$WATCH" = false ]; then
            print_status "Starting development servers for E2E tests..."
            
            # Start backend
            if [ -f "apps/backend/package.json" ]; then
                cd "apps/backend"
                pnpm dev &
                BACKEND_PID=$!
                cd "$ROOT_DIR"
            fi
            
            # Start frontend
            if [ -f "apps/frontend/package.json" ]; then
                cd "apps/frontend"
                pnpm dev &
                FRONTEND_PID=$!
                cd "$ROOT_DIR"
            fi
            
            # Wait for servers to start
            sleep 10
        fi
        
        # Run Playwright tests
        if [ -f "playwright.config.ts" ]; then
            pnpm playwright test
        else
            print_warning "No Playwright configuration found"
        fi
        
        # Cleanup
        if [ -n "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        if [ -n "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null || true
        fi
    else
        # Fallback to Jest E2E tests
        local jest_args=($(build_jest_args))
        jest_args+=("--testPathPattern=.*e2e.*\\.(test|spec)\\.(js|ts|tsx)$")
        
        pnpm jest "${jest_args[@]}"
    fi
}

# Run backend tests
run_backend_tests() {
    print_status "Running backend tests..."
    
    if [ ! -d "apps/backend" ]; then
        print_warning "Backend directory not found, skipping"
        return 0
    fi
    
    cd "apps/backend"
    
    local jest_args=($(build_jest_args))
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        pnpm test "${jest_args[@]}"
    else
        cd "$ROOT_DIR"
        jest_args+=("--testPathPattern=apps/backend/.*\\.(test|spec)\\.(js|ts|tsx)$")
        pnpm jest "${jest_args[@]}"
    fi
    
    cd "$ROOT_DIR"
}

# Run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    if [ ! -d "apps/frontend" ]; then
        print_warning "Frontend directory not found, skipping"
        return 0
    fi
    
    cd "apps/frontend"
    
    local jest_args=($(build_jest_args))
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        pnpm test "${jest_args[@]}"
    else
        cd "$ROOT_DIR"
        jest_args+=("--testPathPattern=apps/frontend/.*\\.(test|spec)\\.(js|ts|tsx)$")
        pnpm jest "${jest_args[@]}"
    fi
    
    cd "$ROOT_DIR"
}

# Run package tests
run_package_tests() {
    print_status "Running shared package tests..."
    
    local jest_args=($(build_jest_args))
    jest_args+=("--testPathPattern=packages/.*\\.(test|spec)\\.(js|ts|tsx)$")
    
    pnpm jest "${jest_args[@]}"
}

# Run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    local jest_args=($(build_jest_args))
    
    # Run Jest for most tests
    pnpm jest "${jest_args[@]}"
    
    # Run E2E tests separately if not in watch mode
    if [ "$WATCH" = false ] && ([ -f "playwright.config.ts" ] || [ -d "e2e" ]); then
        print_status "Running E2E tests..."
        run_e2e_tests
    fi
}

# Generate test report
generate_test_report() {
    if [ "$COVERAGE" = true ]; then
        print_status "Generating test report..."
        
        local report_file="test-report-$(date +%Y%m%d-%H%M%S).json"
        
        # Create basic report structure
        cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "testType": "$TEST_TYPE",
  "coverage": $COVERAGE,
  "options": {
    "watch": $WATCH,
    "verbose": $VERBOSE,
    "parallel": $PARALLEL,
    "bail": $BAIL
  }
}
EOF
        
        print_success "Test report generated: $report_file"
        
        # Show coverage summary if available
        if [ -f "coverage/lcov-report/index.html" ]; then
            print_status "Coverage report: coverage/lcov-report/index.html"
        fi
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up test environment..."
    
    # Kill any background processes
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop test databases if they were started
    if command -v docker >/dev/null 2>&1 && [ -f "scripts/dev/db-manage.sh" ]; then
        bash "scripts/dev/db-manage.sh" stop >/dev/null 2>&1 || true
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Main execution
main() {
    setup_test_env
    
    case "$TEST_TYPE" in
        all)
            run_all_tests
            ;;
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        backend)
            run_backend_tests
            ;;
        frontend)
            run_frontend_tests
            ;;
        packages)
            run_package_tests
            ;;
    esac
    
    generate_test_report
    
    print_success "🧪 Tests completed successfully!"
}

# Run main function
main