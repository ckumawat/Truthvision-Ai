#!/bin/bash

# TruthVision AI - Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "=========================================="
echo "TruthVision AI - Deployment Script"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    log_success "Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm: $(npm --version)"
    
    # Check MySQL
    if ! command -v mysql &> /dev/null; then
        log_warning "MySQL client not found (may not be needed on all systems)"
    else
        log_success "MySQL client found"
    fi
    
    echo ""
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ ! -f .env.example ]; then
            log_error ".env.example not found"
            exit 1
        fi
        cp .env.example .env
        log_success ".env file created from template"
        log_warning "Please edit .env with your production values"
        read -p "Press Enter after editing .env..."
    else
        log_success ".env file already exists"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci --only=production
    log_success "Dependencies installed successfully"
    echo ""
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Check if MySQL is available
    if command -v mysql &> /dev/null; then
        read -p "Enter MySQL root password: " -s db_password
        echo ""
        
        if mysql -u root -p"$db_password" < init.sql 2>/dev/null; then
            log_success "Database initialized"
        else
            log_error "Failed to initialize database"
            log_info "You may need to run: mysql -u root -p < init.sql"
        fi
    else
        log_warning "MySQL client not found - skipping database setup"
        log_info "Please initialize database manually: mysql -u root -p < init.sql"
    fi
    
    echo ""
}

# Start application
start_application() {
    log_info "Starting application..."
    
    # Check if PM2 is installed
    if command -v pm2 &> /dev/null; then
        pm2 start backend/server.js --name truthvision-ai
        pm2 save
        log_success "Application started with PM2"
        log_info "View logs: pm2 logs truthvision-ai"
        log_info "Monitor: pm2 monit"
    else
        log_info "Starting application directly..."
        node backend/server.js &
        log_success "Application started"
        log_warning "Consider installing PM2 for production: npm install -g pm2"
    fi
    
    echo ""
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    sleep 2
    
    # Check if server is running
    if curl -s http://localhost:3002 > /dev/null; then
        log_success "Server is responding"
    else
        log_warning "Server may not be ready yet"
    fi
    
    echo ""
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    echo ""
    
    # Check if running as root (not recommended)
    if [ "$EUID" -eq 0 ]; then
        log_warning "Running as root is not recommended for production"
    fi
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    start_application
    verify_deployment
    
    echo "=========================================="
    log_success "Deployment completed!"
    echo "=========================================="
    echo ""
    echo "Application Details:"
    echo "  - URL: http://localhost:3002"
    echo "  - Environment: $(grep NODE_ENV .env)"
    echo ""
    echo "Next steps:"
    echo "  1. Access the application: http://localhost:3002"
    echo "  2. Monitor logs: pm2 logs truthvision-ai"
    echo "  3. Setup SSL: Configure nginx.conf with your certificates"
    echo "  4. Configure Nginx: Use provided nginx.conf for reverse proxy"
    echo ""
}

# Run main function
main "$@"
