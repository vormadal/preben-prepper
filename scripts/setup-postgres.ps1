# PostgreSQL Docker Setup Script for Preben Prepper (PowerShell)
# This script starts a PostgreSQL container using Podman with both dev and test databases

param(
    [switch]$Force,
    [string]$ContainerName = "preben-prepper-postgres",
    [string]$PostgresVersion = "15",
    [string]$PostgresPassword = "postgres123",
    [string]$PostgresPort = "5432"
)

# Database configurations
$DevDbName = "preben_prepper"
$DevDbUser = "dev_user"
$DevDbPassword = "dev_password"

$TestDbName = "preben_prepper_test"
$TestDbUser = "test_user"
$TestDbPassword = "test_password"

Write-Host "🐘 Starting PostgreSQL container for Preben Prepper..." -ForegroundColor Green

# Function to check if container exists
function Test-ContainerExists {
    param($Name)
    $result = podman container exists $Name 2>$null
    return $LASTEXITCODE -eq 0
}

# Check if container already exists
if (Test-ContainerExists $ContainerName) {
    if ($Force) {
        Write-Host "📦 Container '$ContainerName' already exists. Stopping and removing..." -ForegroundColor Yellow
        podman stop $ContainerName 2>$null | Out-Null
        podman rm $ContainerName 2>$null | Out-Null
    } else {
        Write-Host "❌ Container '$ContainerName' already exists. Use -Force to recreate." -ForegroundColor Red
        Write-Host "Or manually remove it with: podman rm -f $ContainerName" -ForegroundColor Yellow
        exit 1
    }
}

# Start PostgreSQL container
Write-Host "🚀 Starting PostgreSQL container..." -ForegroundColor Green
$containerId = podman run -d `
    --name $ContainerName `
    -e POSTGRES_PASSWORD=$PostgresPassword `
    -e POSTGRES_DB=postgres `
    -p "${PostgresPort}:5432" `
    -v preben-prepper-postgres-data:/var/lib/postgresql/data `
    postgres:$PostgresVersion

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    Start-Sleep -Seconds 1
    $ready = podman exec $ContainerName pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
        break
    }
    if ($attempt -eq $maxAttempts) {
        Write-Host "❌ PostgreSQL failed to start after $maxAttempts seconds" -ForegroundColor Red
        exit 1
    }
} while ($attempt -lt $maxAttempts)

# Create development database and user
Write-Host "🔧 Setting up development database..." -ForegroundColor Green
podman exec $ContainerName psql -U postgres -c "CREATE DATABASE $DevDbName;"
podman exec $ContainerName psql -U postgres -c "CREATE USER $DevDbUser WITH ENCRYPTED PASSWORD '$DevDbPassword';"
podman exec $ContainerName psql -U postgres -c "ALTER USER $DevDbUser CREATEDB;"
podman exec $ContainerName psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DevDbName TO $DevDbUser;"
podman exec $ContainerName psql -U postgres -c "ALTER DATABASE $DevDbName OWNER TO $DevDbUser;"
podman exec $ContainerName psql -U postgres -d $DevDbName -c "GRANT ALL ON SCHEMA public TO $DevDbUser;"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create development database" -ForegroundColor Red
    exit 1
}

# Create test database and user
Write-Host "🧪 Setting up test database..." -ForegroundColor Green
podman exec $ContainerName psql -U postgres -c "CREATE DATABASE $TestDbName;"
podman exec $ContainerName psql -U postgres -c "CREATE USER $TestDbUser WITH ENCRYPTED PASSWORD '$TestDbPassword';"
podman exec $ContainerName psql -U postgres -c "ALTER USER $TestDbUser CREATEDB;"
podman exec $ContainerName psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $TestDbName TO $TestDbUser;"
podman exec $ContainerName psql -U postgres -c "ALTER DATABASE $TestDbName OWNER TO $TestDbUser;"
podman exec $ContainerName psql -U postgres -d $TestDbName -c "GRANT ALL ON SCHEMA public TO $TestDbUser;"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create test database" -ForegroundColor Red
    exit 1
}

# Verify databases
Write-Host "🔍 Verifying database setup..." -ForegroundColor Green
$devDbExists = podman exec $ContainerName psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DevDbName'"
$testDbExists = podman exec $ContainerName psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$TestDbName'"

if ($devDbExists -eq "1" -and $testDbExists -eq "1") {
    Write-Host "✅ Both databases created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database creation failed" -ForegroundColor Red
    exit 1
}

# Display connection information
Write-Host ""
Write-Host "🎉 PostgreSQL setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Connection Information:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🏠 Development Database:" -ForegroundColor White
Write-Host "   Host: localhost"
Write-Host "   Port: $PostgresPort"
Write-Host "   Database: $DevDbName"
Write-Host "   Username: $DevDbUser"
Write-Host "   Password: $DevDbPassword"
Write-Host "   URL: postgresql://$DevDbUser`:$DevDbPassword@localhost`:$PostgresPort/$DevDbName"
Write-Host ""
Write-Host "🧪 Test Database:" -ForegroundColor White
Write-Host "   Host: localhost"
Write-Host "   Port: $PostgresPort"
Write-Host "   Database: $TestDbName"
Write-Host "   Username: $TestDbUser"
Write-Host "   Password: $TestDbPassword"
Write-Host "   URL: postgresql://$TestDbUser`:$TestDbPassword@localhost`:$PostgresPort/$TestDbName"
Write-Host ""
Write-Host "🐘 Admin Access:" -ForegroundColor White
Write-Host "   Username: postgres"
Write-Host "   Password: $PostgresPassword"
Write-Host "   URL: postgresql://postgres`:$PostgresPassword@localhost`:$PostgresPort/postgres"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update your .env file with the development database URL"
Write-Host "   2. Update your .env.test file with the test database URL"
Write-Host "   3. Run: npm run db:migrate"
Write-Host "   4. Run: npm run db:test:setup"
Write-Host ""
Write-Host "🛑 To stop the container: podman stop $ContainerName" -ForegroundColor Red
Write-Host "🗑️  To remove the container: podman rm $ContainerName" -ForegroundColor Red
Write-Host "💾 To remove the data volume: podman volume rm preben-prepper-postgres-data" -ForegroundColor Red
