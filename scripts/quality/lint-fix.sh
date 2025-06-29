#!/bin/bash

# Code Quality and Linting Script for CoTrain
# Runs linting, formatting, and code quality checks

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

# Options
FIX=false
CHECK_ONLY=false
VERBOSE=false
FORMAT_ONLY=false
LINT_ONLY=false
TYPE_CHECK=false
SECURITY_CHECK=false
TARGET_PATH=""
FILE_EXTENSIONS="js,ts,tsx,jsx,json,md,yml,yaml"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX=true
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --format-only)
            FORMAT_ONLY=true
            shift
            ;;
        --lint-only)
            LINT_ONLY=true
            shift
            ;;
        --type-check)
            TYPE_CHECK=true
            shift
            ;;
        --security)
            SECURITY_CHECK=true
            shift
            ;;
        --path)
            TARGET_PATH="$2"
            shift 2
            ;;
        --extensions)
            FILE_EXTENSIONS="$2"
            shift 2
            ;;
        --help|-h)
            echo "CoTrain Code Quality Script"
            echo
            echo "Usage: $0 [options]"
            echo
            echo "Options:"
            echo "  --fix               Auto-fix issues where possible"
            echo "  --check-only        Only check, don't fix anything"
            echo "  --verbose           Show detailed output"
            echo "  --format-only       Run only formatting (Prettier)"
            echo "  --lint-only         Run only linting (ESLint)"
            echo "  --type-check        Run TypeScript type checking"
            echo "  --security          Run security checks"
            echo "  --path <path>       Target specific path"
            echo "  --extensions <ext>  File extensions to process (default: js,ts,tsx,jsx,json,md,yml,yaml)"
            echo "  --help, -h          Show this help message"
            echo
            echo "Examples:"
            echo "  $0                              # Run all checks"
            echo "  $0 --fix                       # Run all checks and auto-fix"
            echo "  $0 --format-only --fix         # Format code only"
            echo "  $0 --lint-only --path src/     # Lint specific directory"
            echo "  $0 --type-check --verbose      # Type check with details"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
    print_error "pnpm is required but not installed"
    print_status "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Change to root directory
cd "$ROOT_DIR"

print_status "Running CoTrain code quality checks..."
print_status "Root directory: $ROOT_DIR"

if [ -n "$TARGET_PATH" ]; then
    print_status "Target path: $TARGET_PATH"
fi

# Check if tools are available
check_tools() {
    print_status "Checking available tools..."
    
    local tools_available=()
    local tools_missing=()
    
    # Check for ESLint
    if [ -f "node_modules/.bin/eslint" ] || command -v eslint >/dev/null 2>&1; then
        tools_available+=("ESLint")
    else
        tools_missing+=("ESLint")
    fi
    
    # Check for Prettier
    if [ -f "node_modules/.bin/prettier" ] || command -v prettier >/dev/null 2>&1; then
        tools_available+=("Prettier")
    else
        tools_missing+=("Prettier")
    fi
    
    # Check for TypeScript
    if [ -f "node_modules/.bin/tsc" ] || command -v tsc >/dev/null 2>&1; then
        tools_available+=("TypeScript")
    else
        tools_missing+=("TypeScript")
    fi
    
    if [ ${#tools_available[@]} -gt 0 ]; then
        print_success "Available tools: ${tools_available[*]}"
    fi
    
    if [ ${#tools_missing[@]} -gt 0 ]; then
        print_warning "Missing tools: ${tools_missing[*]}"
        print_status "Installing missing dependencies..."
        pnpm install
    fi
}

# Run Prettier formatting
run_prettier() {
    print_status "Running Prettier formatting..."
    
    local prettier_cmd="prettier"
    local prettier_args=()
    
    # Use local prettier if available
    if [ -f "node_modules/.bin/prettier" ]; then
        prettier_cmd="./node_modules/.bin/prettier"
    fi
    
    # Build file pattern
    local file_pattern="**/*.{$FILE_EXTENSIONS}"
    if [ -n "$TARGET_PATH" ]; then
        file_pattern="$TARGET_PATH/**/*.{$FILE_EXTENSIONS}"
    fi
    
    # Add arguments
    if [ "$FIX" = true ] && [ "$CHECK_ONLY" = false ]; then
        prettier_args+=("--write")
    else
        prettier_args+=("--check")
    fi
    
    if [ "$VERBOSE" = true ]; then
        prettier_args+=("--list-different")
    fi
    
    # Add config file if it exists
    if [ -f "configs/prettier.config.js" ]; then
        prettier_args+=("--config" "configs/prettier.config.js")
    elif [ -f ".prettierrc" ]; then
        prettier_args+=("--config" ".prettierrc")
    fi
    
    # Add ignore file if it exists
    if [ -f ".prettierignore" ]; then
        prettier_args+=("--ignore-path" ".prettierignore")
    fi
    
    prettier_args+=("$file_pattern")
    
    if [ "$VERBOSE" = true ]; then
        print_status "Running: $prettier_cmd ${prettier_args[*]}"
    fi
    
    if $prettier_cmd "${prettier_args[@]}"; then
        print_success "Prettier formatting completed"
    else
        print_error "Prettier formatting failed"
        return 1
    fi
}

# Run ESLint
run_eslint() {
    print_status "Running ESLint..."
    
    local eslint_cmd="eslint"
    local eslint_args=()
    
    # Use local eslint if available
    if [ -f "node_modules/.bin/eslint" ]; then
        eslint_cmd="./node_modules/.bin/eslint"
    fi
    
    # Build target path
    local target="."
    if [ -n "$TARGET_PATH" ]; then
        target="$TARGET_PATH"
    fi
    
    # Add arguments
    if [ "$FIX" = true ] && [ "$CHECK_ONLY" = false ]; then
        eslint_args+=("--fix")
    fi
    
    if [ "$VERBOSE" = true ]; then
        eslint_args+=("--format" "detailed")
    fi
    
    # Add config file if it exists
    if [ -f "configs/eslint.config.js" ]; then
        eslint_args+=("--config" "configs/eslint.config.js")
    elif [ -f ".eslintrc.js" ]; then
        eslint_args+=("--config" ".eslintrc.js")
    fi
    
    # Add file extensions
    eslint_args+=("--ext" ".js,.ts,.tsx,.jsx")
    
    eslint_args+=("$target")
    
    if [ "$VERBOSE" = true ]; then
        print_status "Running: $eslint_cmd ${eslint_args[*]}"
    fi
    
    if $eslint_cmd "${eslint_args[@]}"; then
        print_success "ESLint completed"
    else
        print_error "ESLint found issues"
        return 1
    fi
}

# Run TypeScript type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    
    local tsc_cmd="tsc"
    
    # Use local tsc if available
    if [ -f "node_modules/.bin/tsc" ]; then
        tsc_cmd="./node_modules/.bin/tsc"
    fi
    
    # Check each TypeScript project
    local ts_projects=()
    
    # Find tsconfig files
    if [ -n "$TARGET_PATH" ]; then
        if [ -f "$TARGET_PATH/tsconfig.json" ]; then
            ts_projects+=("$TARGET_PATH/tsconfig.json")
        fi
    else
        # Check common locations
        for tsconfig in "tsconfig.json" "apps/*/tsconfig.json" "packages/*/tsconfig.json"; do
            if [ -f "$tsconfig" ]; then
                ts_projects+=("$tsconfig")
            fi
        done
    fi
    
    if [ ${#ts_projects[@]} -eq 0 ]; then
        print_warning "No TypeScript configuration files found"
        return 0
    fi
    
    local type_check_failed=false
    
    for project in "${ts_projects[@]}"; do
        print_status "Type checking: $project"
        
        if [ "$VERBOSE" = true ]; then
            print_status "Running: $tsc_cmd --project $project --noEmit"
        fi
        
        if ! $tsc_cmd --project "$project" --noEmit; then
            print_error "Type checking failed for $project"
            type_check_failed=true
        else
            print_success "Type checking passed for $project"
        fi
    done
    
    if [ "$type_check_failed" = true ]; then
        return 1
    fi
    
    print_success "All TypeScript type checks passed"
}

# Run security checks
run_security_check() {
    print_status "Running security checks..."
    
    local security_issues=false
    
    # Check for npm audit
    if command -v pnpm >/dev/null 2>&1; then
        print_status "Running pnpm audit..."
        
        if ! pnpm audit --audit-level moderate; then
            print_warning "Security vulnerabilities found in dependencies"
            security_issues=true
        else
            print_success "No security vulnerabilities found"
        fi
    fi
    
    # Check for common security issues in code
    print_status "Checking for common security issues..."
    
    local security_patterns=(
        "console\.log.*password"
        "console\.log.*secret"
        "console\.log.*token"
        "console\.log.*key"
        "eval\("
        "innerHTML.*\+"
        "document\.write\("
        "dangerouslySetInnerHTML"
    )
    
    for pattern in "${security_patterns[@]}"; do
        if grep -r -E "$pattern" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" . 2>/dev/null; then
            print_warning "Potential security issue found: $pattern"
            security_issues=true
        fi
    done
    
    # Check for hardcoded secrets
    print_status "Checking for hardcoded secrets..."
    
    local secret_patterns=(
        "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}['\"]" 
        "secret.*=.*['\"][a-zA-Z0-9]{20,}['\"]" 
        "password.*=.*['\"][a-zA-Z0-9]{8,}['\"]" 
        "token.*=.*['\"][a-zA-Z0-9]{20,}['\"]" 
    )
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -r -E -i "$pattern" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules . 2>/dev/null; then
            print_warning "Potential hardcoded secret found"
            security_issues=true
        fi
    done
    
    if [ "$security_issues" = false ]; then
        print_success "No security issues found"
    else
        print_warning "Security issues detected - please review"
        return 1
    fi
}

# Generate quality report
generate_quality_report() {
    print_status "Generating code quality report..."
    
    local report_file="quality-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "options": {
    "fix": $FIX,
    "checkOnly": $CHECK_ONLY,
    "formatOnly": $FORMAT_ONLY,
    "lintOnly": $LINT_ONLY,
    "typeCheck": $TYPE_CHECK,
    "securityCheck": $SECURITY_CHECK
  },
  "targetPath": "${TARGET_PATH:-all}",
  "fileExtensions": "$FILE_EXTENSIONS"
}
EOF
    
    print_success "Quality report generated: $report_file"
}

# Main execution
main() {
    local exit_code=0
    
    # Check tools availability
    check_tools
    
    # Run checks based on options
    if [ "$FORMAT_ONLY" = true ]; then
        run_prettier || exit_code=1
    elif [ "$LINT_ONLY" = true ]; then
        run_eslint || exit_code=1
    else
        # Run all checks
        
        # 1. Format code
        if command -v prettier >/dev/null 2>&1 || [ -f "node_modules/.bin/prettier" ]; then
            run_prettier || exit_code=1
        else
            print_warning "Prettier not available, skipping formatting"
        fi
        
        # 2. Lint code
        if command -v eslint >/dev/null 2>&1 || [ -f "node_modules/.bin/eslint" ]; then
            run_eslint || exit_code=1
        else
            print_warning "ESLint not available, skipping linting"
        fi
        
        # 3. Type check (if requested or TypeScript is available)
        if [ "$TYPE_CHECK" = true ] || (command -v tsc >/dev/null 2>&1 || [ -f "node_modules/.bin/tsc" ]); then
            run_type_check || exit_code=1
        fi
        
        # 4. Security check (if requested)
        if [ "$SECURITY_CHECK" = true ]; then
            run_security_check || exit_code=1
        fi
    fi
    
    # Generate report
    generate_quality_report
    
    # Summary
    if [ $exit_code -eq 0 ]; then
        print_success "🎉 All code quality checks passed!"
        
        if [ "$FIX" = true ]; then
            print_status "Code has been automatically fixed where possible"
        fi
    else
        print_error "❌ Some code quality checks failed"
        
        if [ "$FIX" = false ] && [ "$CHECK_ONLY" = false ]; then
            print_status "Run with --fix to automatically fix issues where possible"
        fi
    fi
    
    exit $exit_code
}

# Run main function
main