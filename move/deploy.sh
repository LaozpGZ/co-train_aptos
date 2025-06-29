#!/bin/bash

# CoTrain Aptos Move Contract Deployment Script
# This script helps compile, test, and deploy the training rewards smart contract

set -e

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

# Function to check if Aptos CLI is installed
check_aptos_cli() {
    if ! command -v aptos &> /dev/null; then
        print_error "Aptos CLI is not installed. Please install it first."
        print_status "Visit: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli"
        exit 1
    fi
    print_success "Aptos CLI is installed"
}

# Function to compile the Move contracts
compile_contracts() {
    print_status "Compiling Move contracts..."
    if aptos move compile; then
        print_success "Contracts compiled successfully"
    else
        print_error "Failed to compile contracts"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    print_status "Running Move tests..."
    if aptos move test; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
}

# Function to initialize Aptos account if needed
init_account() {
    local profile=$1
    print_status "Checking Aptos account configuration for profile: $profile"
    
    if [ ! -f ".aptos/config.yaml" ] || ! aptos account list --profile $profile &> /dev/null; then
        print_warning "Account not configured for profile: $profile"
        print_status "Initializing new account..."
        aptos init --profile $profile
        print_success "Account initialized for profile: $profile"
    else
        print_success "Account already configured for profile: $profile"
    fi
}

# Function to fund account from faucet (for devnet/testnet)
fund_account() {
    local profile=$1
    local network=$2
    
    if [ "$network" = "devnet" ] || [ "$network" = "testnet" ]; then
        print_status "Funding account from faucet for $network..."
        if aptos account fund-with-faucet --profile $profile; then
            print_success "Account funded successfully"
        else
            print_warning "Failed to fund account from faucet"
        fi
    fi
}

# Function to deploy contracts
deploy_contracts() {
    local profile=$1
    print_status "Deploying contracts to profile: $profile"
    
    if aptos move publish --profile $profile; then
        print_success "Contracts deployed successfully to $profile"
        
        # Get the account address
        local account_address=$(aptos account list --profile $profile --query balance | grep -o '0x[a-fA-F0-9]*' | head -1)
        print_success "Contract deployed at address: $account_address"
        
        # Save deployment info
        echo "Profile: $profile" > deployment_info.txt
        echo "Address: $account_address" >> deployment_info.txt
        echo "Timestamp: $(date)" >> deployment_info.txt
        print_success "Deployment info saved to deployment_info.txt"
    else
        print_error "Failed to deploy contracts"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  compile     Compile Move contracts"
    echo "  test        Run Move tests"
    echo "  deploy      Deploy contracts (requires profile)"
    echo "  full        Run compile, test, and deploy"
    echo "  init        Initialize Aptos account"
    echo ""
    echo "Options:"
    echo "  --profile   Specify deployment profile (default: devnet)"
    echo "              Available: devnet, testnet, mainnet"
    echo "  --skip-tests Skip running tests"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 compile"
    echo "  $0 test"
    echo "  $0 deploy --profile devnet"
    echo "  $0 full --profile testnet"
    echo "  $0 init --profile devnet"
}

# Main script logic
main() {
    local command="$1"
    local profile="devnet"
    local skip_tests=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --profile)
                profile="$2"
                shift 2
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                if [ -z "$command" ]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Validate profile
    if [[ ! "$profile" =~ ^(devnet|testnet|mainnet)$ ]]; then
        print_error "Invalid profile: $profile. Must be devnet, testnet, or mainnet"
        exit 1
    fi
    
    print_status "Starting CoTrain Move contract deployment script"
    print_status "Profile: $profile"
    
    # Check prerequisites
    check_aptos_cli
    
    case $command in
        compile)
            compile_contracts
            ;;
        test)
            run_tests
            ;;
        init)
            init_account $profile
            fund_account $profile $profile
            ;;
        deploy)
            init_account $profile
            fund_account $profile $profile
            compile_contracts
            if [ "$skip_tests" = false ]; then
                run_tests
            fi
            deploy_contracts $profile
            ;;
        full)
            init_account $profile
            fund_account $profile $profile
            compile_contracts
            if [ "$skip_tests" = false ]; then
                run_tests
            fi
            deploy_contracts $profile
            ;;
        "")
            print_error "No command specified"
            show_usage
            exit 1
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Script completed successfully!"
}

# Run main function with all arguments
main "$@"