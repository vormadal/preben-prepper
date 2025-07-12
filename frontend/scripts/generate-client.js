const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API_DOCS_URL = 'http://localhost:3000/api-docs.json';
const OPENAPI_SPEC_FILE = path.join(__dirname, '..', 'openapi.json');
const CLIENT_OUTPUT_DIR = path.join(__dirname, '..', 'src', 'generated');

// Colors for console output
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkKiotaInstalled() {
  try {
    execSync('kiota --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function installKiota() {
  log('📦 Installing Kiota CLI...', 'yellow');
  try {
    execSync('dotnet tool install --global Microsoft.OpenApi.Kiota', { stdio: 'inherit' });
    log('✅ Kiota CLI installed successfully', 'green');
  } catch (error) {
    throw new Error(`Failed to install Kiota CLI: ${error.message}`);
  }
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

function fixImportExtensions(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      fixImportExtensions(filePath);
    } else if (file.endsWith('.ts')) {
      // Process TypeScript files
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace .js imports with no extension for Next.js compatibility
      content = content.replace(/from\s+['"]([^'"]+)\.js['"]/g, "from '$1'");
      content = content.replace(/import\s+['"]([^'"]+)\.js['"]/g, "import '$1'");
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

async function main() {
  try {
    log('🔄 Generating Kiota API client...', 'blue');

    // Check if Kiota is installed, install if not
    if (!checkKiotaInstalled()) {
      log('⚠️  Kiota CLI not found. Installing...', 'yellow');
      installKiota();
      
      // Check again after installation
      if (!checkKiotaInstalled()) {
        throw new Error('Kiota CLI still not found after installation. Please restart your terminal or manually install with: dotnet tool install --global Microsoft.OpenApi.Kiota');
      }
    }

    // Download OpenAPI spec
    log('📥 Downloading OpenAPI specification...', 'yellow');
    try {
      await downloadFile(API_DOCS_URL, OPENAPI_SPEC_FILE);
    } catch (error) {
      throw new Error(`Failed to download OpenAPI specification from ${API_DOCS_URL}. Please ensure the backend server is running.`);
    }
    
    // Verify the file was downloaded
    if (!fs.existsSync(OPENAPI_SPEC_FILE)) {
      throw new Error('Failed to download OpenAPI specification');
    }

    // Clean up existing generated client
    if (fs.existsSync(CLIENT_OUTPUT_DIR)) {
      log('🧹 Cleaning up existing generated client...', 'yellow');
      fs.rmSync(CLIENT_OUTPUT_DIR, { recursive: true, force: true });
    }

    // Generate client using Kiota
    log('⚡ Generating TypeScript client...', 'yellow');
    
    const command = `kiota generate -l TypeScript -d "${OPENAPI_SPEC_FILE}" -o "${CLIENT_OUTPUT_DIR}" -n PrebenPrepperApiClient --clean-output --exclude-backward-compatible`;
    
    execSync(command, { stdio: 'inherit' });

    // Post-process generated files to fix import extensions for Next.js
    log('🔧 Post-processing generated files...', 'yellow');
    fixImportExtensions(CLIENT_OUTPUT_DIR);

    // Check if generation was successful
    if (!fs.existsSync(CLIENT_OUTPUT_DIR)) {
      throw new Error('Client generation failed - output directory not created');
    }

    // Clean up temporary spec file
    if (fs.existsSync(OPENAPI_SPEC_FILE)) {
      fs.unlinkSync(OPENAPI_SPEC_FILE);
    }

    log('✅ API client generated successfully!', 'green');
    log(`📂 Generated client available at: ${CLIENT_OUTPUT_DIR}`, 'green');

  } catch (error) {
    log(`❌ Error generating API client: ${error.message}`, 'red');
    
    // Clean up temporary files on error
    if (fs.existsSync(OPENAPI_SPEC_FILE)) {
      fs.unlinkSync(OPENAPI_SPEC_FILE);
    }
    
    console.log('');
    log('🔧 Troubleshooting steps:', 'yellow');
    log('1. Ensure .NET SDK is installed and in PATH', 'reset');
    log('2. Try manually installing Kiota: dotnet tool install --global Microsoft.OpenApi.Kiota', 'reset');
    log('3. Restart your terminal/command prompt', 'reset');
    log('4. Ensure backend server is running on http://localhost:3000', 'reset');
    log('5. Check .NET tools path: dotnet tool list --global', 'reset');
    
    process.exit(1);
  }
}

main();
