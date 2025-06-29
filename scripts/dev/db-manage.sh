#!/bin/bash

# Database Management Script for CoTrain
# Provides utilities for database operations

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-cotrain}
DB_NAME=${DB_NAME:-cotrain}
TEST_DB_NAME=${TEST_DB_NAME:-cotrain_test}

# Docker container names
POSTGRES_CONTAINER="cotrain-postgres"
REDIS_CONTAINER="cotrain-redis"

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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker container is running
container_running() {
    docker ps --format "table {{.Names}}" | grep -q "$1"
}

# Start PostgreSQL container
start_postgres() {
    print_status "Starting PostgreSQL container..."
    
    if container_running "$POSTGRES_CONTAINER"; then
        print_warning "PostgreSQL container is already running"
        return 0
    fi
    
    # Check if container exists but is stopped
    if docker ps -a --format "table {{.Names}}" | grep -q "$POSTGRES_CONTAINER"; then
        print_status "Starting existing PostgreSQL container..."
        docker start "$POSTGRES_CONTAINER"
    else
        print_status "Creating new PostgreSQL container..."
        docker run --name "$POSTGRES_CONTAINER" \
            -e POSTGRES_PASSWORD="$DB_PASSWORD" \
            -e POSTGRES_DB="$DB_NAME" \
            -e POSTGRES_USER="$DB_USERNAME" \
            -p "$DB_PORT":5432 \
            -d postgres:15
    fi
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker exec "$POSTGRES_CONTAINER" pg_isready -U "$DB_USERNAME" >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            return 0
        fi
        sleep 1
    done
    
    print_error "PostgreSQL failed to start within 30 seconds"
    return 1
}

# Stop PostgreSQL container
stop_postgres() {
    print_status "Stopping PostgreSQL container..."
    
    if container_running "$POSTGRES_CONTAINER"; then
        docker stop "$POSTGRES_CONTAINER"
        print_success "PostgreSQL container stopped"
    else
        print_warning "PostgreSQL container is not running"
    fi
}

# Start Redis container
start_redis() {
    print_status "Starting Redis container..."
    
    if container_running "$REDIS_CONTAINER"; then
        print_warning "Redis container is already running"
        return 0
    fi
    
    # Check if container exists but is stopped
    if docker ps -a --format "table {{.Names}}" | grep -q "$REDIS_CONTAINER"; then
        print_status "Starting existing Redis container..."
        docker start "$REDIS_CONTAINER"
    else
        print_status "Creating new Redis container..."
        docker run --name "$REDIS_CONTAINER" \
            -p 6379:6379 \
            -d redis:7-alpine
    fi
    
    print_success "Redis container started"
}

# Stop Redis container
stop_redis() {
    print_status "Stopping Redis container..."
    
    if container_running "$REDIS_CONTAINER"; then
        docker stop "$REDIS_CONTAINER"
        print_success "Redis container stopped"
    else
        print_warning "Redis container is not running"
    fi
}

# Create database
create_db() {
    local db_name=${1:-$DB_NAME}
    print_status "Creating database: $db_name"
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USERNAME" -c "CREATE DATABASE $db_name;" 2>/dev/null || {
        print_warning "Database $db_name might already exist"
    }
    
    print_success "Database $db_name is ready"
}

# Drop database
drop_db() {
    local db_name=${1:-$DB_NAME}
    
    read -p "Are you sure you want to drop database '$db_name'? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Operation cancelled"
        return 0
    fi
    
    print_status "Dropping database: $db_name"
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USERNAME" -c "DROP DATABASE IF EXISTS $db_name;"
    print_success "Database $db_name dropped"
}

# Reset database
reset_db() {
    local db_name=${1:-$DB_NAME}
    print_status "Resetting database: $db_name"
    
    drop_db "$db_name"
    create_db "$db_name"
    
    print_success "Database $db_name reset complete"
}

# Run migrations
migrate() {
    print_status "Running database migrations..."
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    # Change to backend directory and run migrations
    cd "$(dirname "$0")/../../apps/backend"
    
    if [ -f "package.json" ] && grep -q "typeorm" package.json; then
        pnpm typeorm migration:run
        print_success "Migrations completed"
    else
        print_warning "No migration system found"
    fi
}

# Seed database
seed() {
    print_status "Seeding database..."
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    # Change to backend directory and run seeds
    cd "$(dirname "$0")/../../apps/backend"
    
    if [ -f "src/database/seeds/index.ts" ]; then
        pnpm ts-node src/database/seeds/index.ts
        print_success "Database seeded"
    else
        print_warning "No seed files found"
    fi
}

# Connect to database
connect() {
    local db_name=${1:-$DB_NAME}
    print_status "Connecting to database: $db_name"
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    docker exec -it "$POSTGRES_CONTAINER" psql -U "$DB_USERNAME" -d "$db_name"
}

# Show database status
status() {
    print_status "Database Status:"
    
    if container_running "$POSTGRES_CONTAINER"; then
        print_success "PostgreSQL: Running"
        docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USERNAME" -c "\l" 2>/dev/null | grep -E "$DB_NAME|$TEST_DB_NAME" || true
    else
        print_warning "PostgreSQL: Not running"
    fi
    
    if container_running "$REDIS_CONTAINER"; then
        print_success "Redis: Running"
    else
        print_warning "Redis: Not running"
    fi
}

# Backup database
backup() {
    local db_name=${1:-$DB_NAME}
    local backup_file="backup_${db_name}_$(date +%Y%m%d_%H%M%S).sql"
    
    print_status "Creating backup of database: $db_name"
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USERNAME" "$db_name" > "$backup_file"
    print_success "Backup created: $backup_file"
}

# Restore database
restore() {
    local backup_file="$1"
    local db_name=${2:-$DB_NAME}
    
    if [ -z "$backup_file" ]; then
        print_error "Please provide backup file path"
        print_status "Usage: $0 restore <backup_file> [database_name]"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_status "Restoring database: $db_name from $backup_file"
    
    if ! container_running "$POSTGRES_CONTAINER"; then
        print_error "PostgreSQL container is not running. Start it first with: $0 start"
        return 1
    fi
    
    # Drop and recreate database
    drop_db "$db_name"
    create_db "$db_name"
    
    # Restore from backup
    docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USERNAME" "$db_name" < "$backup_file"
    print_success "Database restored from $backup_file"
}

# Show help
show_help() {
    echo "CoTrain Database Management Script"
    echo
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  start           Start PostgreSQL and Redis containers"
    echo "  stop            Stop PostgreSQL and Redis containers"
    echo "  restart         Restart PostgreSQL and Redis containers"
    echo "  status          Show database status"
    echo "  create [name]   Create database (default: $DB_NAME)"
    echo "  drop [name]     Drop database (default: $DB_NAME)"
    echo "  reset [name]    Reset database (drop and create)"
    echo "  migrate         Run database migrations"
    echo "  seed            Seed database with initial data"
    echo "  connect [name]  Connect to database (default: $DB_NAME)"
    echo "  backup [name]   Create database backup"
    echo "  restore <file> [name]  Restore database from backup"
    echo "  help            Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 reset                    # Reset main database"
    echo "  $0 create cotrain_test      # Create test database"
    echo "  $0 backup cotrain           # Backup main database"
    echo "  $0 restore backup.sql       # Restore from backup"
}

# Main script logic
case "$1" in
    start)
        if ! command_exists docker; then
            print_error "Docker is required but not installed"
            exit 1
        fi
        start_postgres
        start_redis
        create_db "$DB_NAME"
        create_db "$TEST_DB_NAME"
        ;;
    stop)
        stop_postgres
        stop_redis
        ;;
    restart)
        stop_postgres
        stop_redis
        start_postgres
        start_redis
        ;;
    status)
        status
        ;;
    create)
        create_db "$2"
        ;;
    drop)
        drop_db "$2"
        ;;
    reset)
        reset_db "$2"
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    connect)
        connect "$2"
        ;;
    backup)
        backup "$2"
        ;;
    restore)
        restore "$2" "$3"
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        print_error "No command specified"
        show_help
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac