# this script will run npm install, npm run build, and use node to start the mcp server

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$Dev,
    [switch]$Help
)

function Show-Help {
    Write-Error "Azure SDK Java MCP Server Launcher"
    Write-Error ""
    Write-Error "Usage: .\azure-sdk-java-mcp.ps1 [options]"
    Write-Error ""
    Write-Error "Options:"
    Write-Error "  -SkipInstall    Skip npm install step"
    Write-Error "  -SkipBuild      Skip npm run build step"
    Write-Error "  -Dev            Run in development mode (npm run dev)"
    Write-Error "  -Help           Show this help message"
    Write-Error ""
    Write-Error "Examples:"
    Write-Error "  .\azure-sdk-java-mcp.ps1                    # Full build and start"
    Write-Error "  .\azure-sdk-java-mcp.ps1 -SkipInstall       # Skip install, build and start"
    Write-Error "  .\azure-sdk-java-mcp.ps1 -Dev               # Development mode with watch"
    Write-Error ""
}

$PSStyle.OutputRendering = [System.Management.Automation.OutputRendering]::PlainText;

if ($Help) {
    Show-Help
    exit 0
}

# # Set error action preference
# $ErrorActionPreference = "Stop"

try {
    # Get the script directory
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Write-Error "Working directory: $ScriptDir"
    
    # Change to the script directory
    Set-Location $ScriptDir
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found in current directory: $ScriptDir"
        exit 1
    }
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-Error "Node.js version: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed or not in PATH. Please install Node.js first."
        exit 1
    }
    
    # Check if npm is available
    try {
        $npmVersion = npm --version
        Write-Error "npm version: $npmVersion"
    } catch {
        Write-Error "npm is not installed or not in PATH. Please install npm first."
        exit 1
    }
    
    # Step 1: npm install (unless skipped)
    if (-not $SkipInstall) {
        Write-Error "`nRunning npm install..."
        npm install -s
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed with exit code $LASTEXITCODE"
            exit $LASTEXITCODE
        }
        Write-Error "npm install completed successfully"
    } else {
        Write-Error "`nSkipping npm install..."
    }
    
    # Step 2: npm run clean and build (unless skipped or in dev mode)
    if (-not $SkipBuild -and -not $Dev) {
        Write-Error "`nRunning npm run clean..."
        npm run clean -s
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm run clean failed with exit code $LASTEXITCODE"
            exit $LASTEXITCODE
        }
        Write-Error "npm run clean completed successfully"
        
        Write-Error "`nRunning npm run build..."
        npm run build -s
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm run build failed with exit code $LASTEXITCODE"
            exit $LASTEXITCODE
        }
        Write-Error "npm run build completed successfully"
    } elseif ($Dev) {
        Write-Error "`nSkipping clean and build for development mode..."
    } else {
        Write-Error "`nSkipping npm run clean and build..."
    }
    
    # Step 3: Start the server
    if ($Dev) {
        Write-Error "`nStarting MCP server in development mode..."
        Write-Error "Press Ctrl+C to stop the server"
        npm run start -s
    } else {
        # Check if dist directory exists
        if (-not (Test-Path "dist")) {
            Write-Error "dist directory not found. Please run build first or use -Dev flag."
            exit 1
        }
        
        # Check if main file exists
        if (-not (Test-Path "dist/index.js")) {
            Write-Error "dist/index.js not found. Please run build first."
            exit 1
        }
        
        Write-Error "`nStarting MCP server..."
        Write-Error "Press Ctrl+C to stop the server"
        npm run start -s
    }
} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
} finally {
    # Restore original location
    Pop-Location -ErrorAction SilentlyContinue
}