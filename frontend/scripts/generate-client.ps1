#!/usr/bin/env pwsh

param(
    [string]$ApiUrl = "http://localhost:3000/api-docs.json",
    [string]$OutputDir = "src/generated"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Generating Kiota API client..." -ForegroundColor Blue

# Function to check if Kiota is installed
function Test-KiotaInstalled {
    try {
        $null = Get-Command kiota -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to install Kiota
function Install-Kiota {
    Write-Host "📦 Installing Kiota CLI..." -ForegroundColor Yellow
    try {
        dotnet tool install --global Microsoft.OpenApi.Kiota
        Write-Host "✅ Kiota CLI installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Kiota CLI" -ForegroundColor Red
        throw "Failed to install Kiota CLI: $($_.Exception.Message)"
    }
}

try {
    # Check if Kiota is installed, install if not
    if (-not (Test-KiotaInstalled)) {
        Write-Host "⚠️  Kiota CLI not found. Installing..." -ForegroundColor Yellow
        Install-Kiota
        
        # Refresh PATH and test again
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        if (-not (Test-KiotaInstalled)) {
            throw "Kiota CLI still not found after installation. Please restart your terminal or manually install with: dotnet tool install --global Microsoft.OpenApi.Kiota"
        }
    }

    $specFile = "openapi.json"
    $clientDir = $OutputDir
    
    # Download OpenAPI spec
    Write-Host "📥 Downloading OpenAPI specification..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $ApiUrl -OutFile $specFile
    } catch {
        throw "Failed to download OpenAPI specification from $ApiUrl. Please ensure the backend server is running."
    }
    
    # Verify the file was downloaded
    if (!(Test-Path $specFile)) {
        throw "Failed to download OpenAPI specification"
    }

    # Clean up existing generated client
    if (Test-Path $clientDir) {
        Write-Host "🧹 Cleaning up existing generated client..." -ForegroundColor Yellow
        Remove-Item -Path $clientDir -Recurse -Force
    }

    # Generate client using Kiota
    Write-Host "⚡ Generating TypeScript client..." -ForegroundColor Yellow
    & kiota generate -l TypeScript -d $specFile -o $clientDir -n PrebenPrepperApiClient --clean-output

    # Post-process generated files to fix import extensions for Next.js
    Write-Host "🔧 Post-processing generated files..." -ForegroundColor Yellow
    Get-ChildItem -Path $clientDir -Recurse -Filter "*.ts" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $content = $content -replace "from\s+['""]([^'""]+)\.js['""]", "from '$1'"
        $content = $content -replace "import\s+['""]([^'""]+)\.js['""]", "import '$1'"
        Set-Content -Path $_.FullName -Value $content
    }

    # Check if generation was successful
    if (!(Test-Path $clientDir)) {
        throw "Client generation failed - output directory not created"
    }

    # Clean up temporary spec file
    if (Test-Path $specFile) {
        Remove-Item $specFile -Force
    }

    Write-Host "✅ API client generated successfully!" -ForegroundColor Green
    Write-Host "📂 Generated client available at: $clientDir" -ForegroundColor Green

} catch {
    Write-Host "❌ Error generating API client: $($_.Exception.Message)" -ForegroundColor Red
    
    # Clean up temporary files on error
    if (Test-Path $specFile) {
        Remove-Item $specFile -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure .NET SDK is installed and in PATH" -ForegroundColor White
    Write-Host "2. Try manually installing Kiota: dotnet tool install --global Microsoft.OpenApi.Kiota" -ForegroundColor White
    Write-Host "3. Restart your terminal/PowerShell session" -ForegroundColor White
    Write-Host "4. Ensure backend server is running on http://localhost:3000" -ForegroundColor White
    
    exit 1
}
