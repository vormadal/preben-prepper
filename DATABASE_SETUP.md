# Database Setup with Podman

This guide explains how to set up PostgreSQL databases for both development and testing using Podman containers.

## Quick Start

### 1. Prerequisites
- [Podman](https://podman.io/) installed on your system
- PowerShell (Windows) or Bash (Linux/macOS)

### 2. Start PostgreSQL Container

```bash
# Windows (PowerShell)
npm run docker:postgres

# Or directly:
pwsh -ExecutionPolicy Bypass -File scripts/setup-postgres.ps1

# Linux/macOS (Bash)
chmod +x scripts/setup-postgres.sh
./scripts/setup-postgres.sh
```

### 3. Set Up Environment Files

```bash
# Copy and configure development environment
cp .env.example .env

# Copy and configure test environment  
cp .env.test.example .env.test
```

The database URLs are already configured in the example files to match the container setup.

### 4. Run Database Migrations

```bash
# Development database
npm run db

# Test database
npm run db:test:setup
```

### 5. Verify Setup

```bash
# Run basic tests (no database required)
npm run test:basic

# Run integration tests (requires database)
npm run test:integration
```

## Database Configuration

The setup script creates:

### 🏠 **Development Database**
- **Database**: `preben_prepper`
- **User**: `dev_user`
- **Password**: `dev_password`
- **URL**: `postgresql://dev_user:dev_password@localhost:5432/preben_prepper`

### 🧪 **Test Database**
- **Database**: `preben_prepper_test`
- **User**: `test_user`
- **Password**: `test_password`
- **URL**: `postgresql://test_user:test_password@localhost:5432/preben_prepper_test`

### 🐘 **Admin Access**
- **User**: `postgres`
- **Password**: `postgres123`
- **URL**: `postgresql://postgres:postgres123@localhost:5432/postgres`

## Available NPM Scripts

### Container Management
```bash
# Start PostgreSQL container
npm run docker:postgres

# Force recreate container (if it already exists)
npm run docker:postgres:force

# Stop container
npm run docker:postgres:stop

# Remove container
npm run docker:postgres:remove

# Remove data volume (⚠️ DESTROYS ALL DATA)
npm run docker:postgres:clean
```

### Database Operations
```bash
# Development database
npm run db                    # Run migrations
npm run db:seed              # Seed with sample data

# Test database
npm run db:test:setup        # Apply migrations
npm run db:test:reset        # Reset database
```

### Testing
```bash
npm test                     # Basic tests only
npm run test:basic           # Basic app tests (no DB)
npm run test:integration     # Full integration tests (requires DB)
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
```

## Script Features

### ✅ **What the Setup Script Does**

1. **Container Management**
   - Checks if container already exists
   - Optionally removes existing container with `-Force`
   - Creates new container with persistent volume

2. **Database Creation**
   - Creates development database and user
   - Creates test database and user
   - Sets up proper permissions and ownership

3. **Health Checks**
   - Waits for PostgreSQL to be ready
   - Verifies database creation
   - Provides connection information

4. **Data Persistence**
   - Uses named volume `preben-prepper-postgres-data`
   - Data survives container restarts
   - Can be backed up/restored

### 🔧 **PowerShell Script Options**

```powershell
# Basic usage
.\scripts\setup-postgres.ps1

# Force recreate existing container
.\scripts\setup-postgres.ps1 -Force

# Custom configuration
.\scripts\setup-postgres.ps1 -ContainerName "my-postgres" -PostgresVersion "14" -PostgresPort "5433"
```

## Troubleshooting

### Container Issues

```bash
# Check container status
podman ps -a

# View container logs
podman logs preben-prepper-postgres

# Connect to container
podman exec -it preben-prepper-postgres bash

# Connect to PostgreSQL directly
podman exec -it preben-prepper-postgres psql -U postgres
```

### Database Connection Issues

```bash
# Test development database connection
podman exec preben-prepper-postgres psql -U dev_user -d preben_prepper -c "SELECT version();"

# Test test database connection
podman exec preben-prepper-postgres psql -U test_user -d preben_prepper_test -c "SELECT version();"

# List all databases
podman exec preben-prepper-postgres psql -U postgres -c "\l"
```

### Common Solutions

1. **Port Already in Use**
   ```bash
   # Check what's using port 5432
   netstat -tulpn | grep 5432
   
   # Stop other PostgreSQL services
   sudo systemctl stop postgresql
   ```

2. **Permission Denied**
   ```bash
   # On Linux, ensure podman has correct permissions
   sudo usermod -aG podman $USER
   newgrp podman
   ```

3. **Container Won't Start**
   ```bash
   # Remove existing container and volume
   npm run docker:postgres:remove
   npm run docker:postgres:clean
   npm run docker:postgres
   ```

## Data Management

### Backup Data
```bash
# Backup development database
podman exec preben-prepper-postgres pg_dump -U dev_user preben_prepper > backup_dev.sql

# Backup test database
podman exec preben-prepper-postgres pg_dump -U test_user preben_prepper_test > backup_test.sql
```

### Restore Data
```bash
# Restore development database
cat backup_dev.sql | podman exec -i preben-prepper-postgres psql -U dev_user -d preben_prepper

# Restore test database
cat backup_test.sql | podman exec -i preben-prepper-postgres psql -U test_user -d preben_prepper_test
```

### Reset Everything
```bash
# Complete reset (⚠️ DESTROYS ALL DATA)
npm run docker:postgres:stop
npm run docker:postgres:remove
npm run docker:postgres:clean
npm run docker:postgres
npm run db
npm run db:test:setup
```

## Security Notes

- Default passwords are for development only
- Change passwords for production environments
- Use environment variables for sensitive configuration
- Consider using secrets management for production

## Next Steps

1. **Environment Configuration**: Update `.env` and `.env.test` if needed
2. **Run Migrations**: Execute `npm run db` and `npm run db:test:setup`
3. **Seed Data**: Run `npm run db:seed` for sample data
4. **Test Setup**: Verify with `npm run test:integration`
5. **Development**: Start developing with `npm run dev`
