# MCP Server for Java SDK Tools

A Model Context Protocol (MCP) server that provides tools for Java SDK development, built with TypeScript.

## Features

This MCP server provides the following tools:

1. **generate_client_code** - Generate Java client code from OpenAPI/Swagger specifications
2. **generate_mcp_server** - Generate MCP server stub code from OpenAPI/Swagger specifications  
3. **create_quickstart_project** - Create Azure SDK for Java quickstart projects
4. **check_service_status** - Check Azure service status by API version

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Development

To run in development mode with automatic recompilation:
```bash
npm run dev
```

## Usage

This server is designed to be used with MCP-compatible clients. The server communicates via stdio and provides tools that can be called by AI assistants or other MCP clients.

### Tool Examples

#### Generate Client Code
```json
{
  "name": "generate_client_code",
  "arguments": {
    "specUrl": "https://api.example.com/swagger.json",
    "outputDir": "./generated-client",
    "packageName": "com.example.client"
  }
}
```

#### Create Quickstart Project
```json
{
  "name": "create_quickstart_project", 
  "arguments": {
    "projectName": "my-azure-app",
    "outputDir": "./projects",
    "azureService": "storage"
  }
}
```

## Project Structure

```
mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript output
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Contributing

1. Make changes to the TypeScript source files in `src/`
2. Build the project with `npm run build`
3. Test your changes with `npm start`

## License

MIT
