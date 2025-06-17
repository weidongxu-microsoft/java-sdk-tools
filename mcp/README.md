# MCP Server for Java SDK Tools

A Model Context Protocol (MCP) server that provides tools for generating Java SDKs from TypeSpec definitions using the `tsp-client` tool.

## Features

This MCP server provides the following tool:

1. **generate_java_sdk** - Generate Java SDK from TypeSpec definitions in a directory containing `tsp-location.yaml`

## Prerequisites

Before using this MCP server, ensure you have:

1. **TypeSpec Client** - The `tsp-client` command-line tool must be installed and available in your PATH
2. **Project Structure** - A directory containing `tsp-location.yaml` with your TypeSpec configuration

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

To run tests:
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
```

## Usage

This server is designed to be used with MCP-compatible clients. The server communicates via stdio and provides tools for generating Java SDKs from TypeSpec definitions.

### Tool: generate_java_sdk

Generates a Java SDK by running `tsp-client update --debug` in a directory containing `tsp-location.yaml`.

**Parameters:**
- `cwd` (required): The absolute path to the directory containing `tsp-location.yaml`

**Example:**
```json
{
  "name": "generate_java_sdk",
  "arguments": {
    "cwd": "/path/to/your/typespec/project"
  }
}
```

The tool will:
1. Change to the specified directory
2. Execute `tsp-client update --debug`
3. Return the generation results with success/failure status
4. Include stdout and stderr output for debugging

## Project Structure

```
mcp/
├── src/
│   ├── index.ts          # Main MCP server implementation
│   └── utils/
│       ├── index.ts      # Utility functions for process execution
│       ├── process.ts    # Process spawning and execution utilities
│       └── process.spec.ts # Tests for process utilities
├── dist/                 # Compiled JavaScript output
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
└── README.md            # This file
```

## Contributing

1. Make changes to the TypeScript source files in `src/`
2. Add tests for new functionality in `src/**/*.spec.ts`
3. Build the project with `npm run build`
4. Test your changes with `npm test` and `npm start`

## License

MIT
