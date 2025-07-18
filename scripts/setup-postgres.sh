#!/bin/bash

# PostgreSQL Docker Setup Script for Preben Prepper
# This script starts a PostgreSQL container using Podman with both dev and test databases

set -e

# Configuration
CONTAINER_NAME="preben-prepper-postgres"
POSTGRES_VERSION="15"
POSTGRES_PASSWORD="postgres123"
POSTGRES_PORT="5432"

# Database configurations
DEV_DB_NAME="preben_prepper"
DEV_DB_USER="dev_user"
DEV_DB_PASSWORD="dev_password"

TEST_DB_NAME="preben_prepper_test"
TEST_DB_USER="test_user"
TEST_DB_PASSWORD="test_password"

echo "🐘 Starting PostgreSQL container for Preben Prepper..."

# Check if container already exists
if podman container exists $CONTAINER_NAME; then
    echo "📦 Container '$CONTAINER_NAME' already exists. Stopping and removing..."
    podman stop $CONTAINER_NAME 2>/dev/null || true
    podman rm $CONTAINER_NAME 2>/dev/null || true
fi

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
podman run -d \
    --name $CONTAINER_NAME \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -e POSTGRES_DB=postgres \
    -p $POSTGRES_PORT:5432 \
    -v preben-prepper-postgres-data:/var/lib/postgresql/data \
    postgres:$POSTGRES_VERSION

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if podman exec $CONTAINER_NAME pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start after 30 seconds"
        exit 1
    fi
    sleep 1
done

# Create development database and user
echo "🔧 Setting up development database..."
podman exec $CONTAINER_NAME psql -U postgres -c "CREATE DATABASE $DEV_DB_NAME;"
podman exec $CONTAINER_NAME psql -U postgres -c "CREATE USER $DEV_DB_USER WITH ENCRYPTED PASSWORD '$DEV_DB_PASSWORD';"
podman exec $CONTAINER_NAME psql -U postgres -c "ALTER USER $DEV_DB_USER CREATEDB;"
podman exec $CONTAINER_NAME psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DEV_DB_NAME TO $DEV_DB_USER;"
podman exec $CONTAINER_NAME psql -U postgres -c "ALTER DATABASE $DEV_DB_NAME OWNER TO $DEV_DB_USER;"
podman exec $CONTAINER_NAME psql -U postgres -d $DEV_DB_NAME -c "GRANT ALL ON SCHEMA public TO $DEV_DB_USER;"

# Create test database and user
echo "🧪 Setting up test database..."
podman exec $CONTAINER_NAME psql -U postgres -c "CREATE DATABASE $TEST_DB_NAME;"
podman exec $CONTAINER_NAME psql -U postgres -c "CREATE USER $TEST_DB_USER WITH ENCRYPTED PASSWORD '$TEST_DB_PASSWORD';"
podman exec $CONTAINER_NAME psql -U postgres -c "ALTER USER $TEST_DB_USER CREATEDB;"
podman exec $CONTAINER_NAME psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $TEST_DB_NAME TO $TEST_DB_USER;"
podman exec $CONTAINER_NAME psql -U postgres -c "ALTER DATABASE $TEST_DB_NAME OWNER TO $TEST_DB_USER;"
podman exec $CONTAINER_NAME psql -U postgres -d $TEST_DB_NAME -c "GRANT ALL ON SCHEMA public TO $TEST_DB_USER;"

# Verify databases
echo "🔍 Verifying database setup..."
DEV_DB_EXISTS=$(podman exec $CONTAINER_NAME psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DEV_DB_NAME'")
TEST_DB_EXISTS=$(podman exec $CONTAINER_NAME psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$TEST_DB_NAME'")

if [ "$DEV_DB_EXISTS" = "1" ] && [ "$TEST_DB_EXISTS" = "1" ]; then
    echo "✅ Both databases created successfully!"
else
    echo "❌ Database creation failed"
    exit 1
fi

# Display connection information
echo ""
echo "🎉 PostgreSQL setup complete!"
echo ""
echo "📋 Connection Information:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏠 Development Database:"
echo "   Host: localhost"
echo "   Port: $POSTGRES_PORT"
echo "   Database: $DEV_DB_NAME"
echo "   Username: $DEV_DB_USER"
echo "   Password: $DEV_DB_PASSWORD"
echo "   URL: postgresql://$DEV_DB_USER:$DEV_DB_PASSWORD@localhost:$POSTGRES_PORT/$DEV_DB_NAME"
echo ""
echo "🧪 Test Database:"
echo "   Host: localhost"
echo "   Port: $POSTGRES_PORT"
echo "   Database: $TEST_DB_NAME"
echo "   Username: $TEST_DB_USER"
echo "   Password: $TEST_DB_PASSWORD"
echo "   URL: postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@localhost:$POSTGRES_PORT/$TEST_DB_NAME"
echo ""
echo "🐘 Admin Access:"
echo "   Username: postgres"
echo "   Password: $POSTGRES_PASSWORD"
echo "   URL: postgresql://postgres:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/postgres"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo "   1. Update your .env file with the development database URL"
echo "   2. Update your .env.test file with the test database URL"
echo "   3. Run: npm run db:migrate"
echo "   4. Run: npm run db:test:setup"
echo ""
echo "🛑 To stop the container: podman stop $CONTAINER_NAME"
echo "🗑️  To remove the container: podman rm $CONTAINER_NAME"
echo "💾 To remove the data volume: podman volume rm preben-prepper-postgres-data"
