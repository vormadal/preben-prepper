#!/usr/bin/env pwsh

Write-Host "🧪 Testing Kiota API client setup..." -ForegroundColor Blue

# Check if Kiota is installed
try {
    $kiotaVersion = kiota --version
    Write-Host "✅ Kiota CLI is installed: $kiotaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Kiota CLI is not installed. Install with: npm install -g @microsoft/kiota" -ForegroundColor Red
    exit 1
}

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server is not running. Please start the backend server first." -ForegroundColor Red
    Write-Host "   Run: npm run dev (from the root directory)" -ForegroundColor Yellow
    exit 1
}

# Check if OpenAPI spec is accessible
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api-docs/swagger.json" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ OpenAPI specification is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ OpenAPI specification is not accessible at http://localhost:3000/api-docs/swagger.json" -ForegroundColor Red
    exit 1
}

# Check if npm packages are installed
if (Test-Path "node_modules/@microsoft/kiota-abstractions") {
    Write-Host "✅ Kiota packages are installed" -ForegroundColor Green
} else {
    Write-Host "❌ Kiota packages are not installed. Run: npm install" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All checks passed! You can now run: npm run generate-client" -ForegroundColor Green
