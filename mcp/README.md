# Azure Java SDK Tools - MCP Server

A Model Context Protocol (MCP) server that exposes a small set of tools for generating, building, and managing Java SDKs from TypeSpec sources for Azure services.

Server name: `azure-sdk-java-mcp`
Version: `1.0.0`

## Sample mcp.json

```json
{
  "servers": {
    "azure-sdk-java-mcp": {
      "command": "pwsh",
      "args": [
        "c:/github_lab/java-sdk-tools/mcp/azure-sdk-java-mcp.ps1"
      ],
      "type": "stdio",
      "version": "1.0.0"
    }
  },
  "inputs": []
}
```

## Usage

Use the `#mitigateBreaks` tool in azure-rest-api-specs repository.

It is recommended to put the "main.tsp" or "client.tsp" as context. They are the TypeSpec source for the Java SDK.

Tips:
- It may help to disable the "azure-sdk-mcp" tool, if the workspace is in repository root.
- Choose "Allow in this Workspace" upon Copilot permission request.

## Overview

This MCP server communicates over stdio and exposes the following tools (only the tools actually registered in `src/index.ts` are listed here; commented-out tools in the code are intentionally omitted):

### Registered tools

1. `buildJavaSdk`
   - Title: Build Java SDK
   - Description: Build the Java SDK. The SDK is generated from TypeSpec source files.
   - Parameters:
     - `moduleDirectory` (string) — Absolute path to the Java module. The folder name should be `java-sdk`.

2. `getJavaSdkChangelog`
   - Title: Get Java SDK Changelog
   - Description: Retrieve the changelog for a service submodule whose groupId starts with `com.azure`.
   - Parameters:
     - `jarPath` (string) — Absolute path to the JAR file of the Java SDK (typically under the module `target` directory).
     - `groupId` (string) — The Maven groupId for the Java SDK module.
     - `artifactId` (string) — The Maven artifactId for the Java SDK module.

3. `generateJavaSdk`
   - Title: Generate Java SDK
   - Description: Generate the Java SDK from TypeSpec source files.
   - Parameters:
     - `typespecSourceDirectory` (string) — Absolute path to the TypeSpec source files. The folder should contain a `main.tsp` file and optionally a `client.tsp` file.

4. `mitigateMigrationBreaks`
   - Title: Mitigate Breaks for TypeSpec Migration
   - Description: Provides step-by-step instructions for mitigating breaking changes after migrating from Swagger (OpenAPI) to TypeSpec.
   - Parameters: none

## Usage notes

- Start the server using the included PowerShell wrapper (`azure-sdk-java-mcp.ps1`) or run the built Node entrypoint directly.
- The server communicates via stdio and is intended to be used with MCP-compatible clients (for example, GitHub Copilot or other MCP clients).
- Tool names are case-sensitive and should be invoked exactly as listed above.

## Prerequisites

- Node.js (v20 or later recommended)
- A compatible MCP client that can connect over stdio
- Following npm packages installed globally:
  - [ncu](https://www.npmjs.com/package/npm-check-updates)
  - [typespec compiler](https://www.npmjs.com/package/@typespec/compiler)
  - [tsp-client](https://github.com/Azure/azure-sdk-tools/tree/main/tools/tsp-client)
- For build-related tools: a working Java/Maven environment when building generated Java SDKs

## Development

- Run in development mode:

```bash
npm run dev
```

- Build the project:

```bash
npm run build
```

- Run tests:

```bash
npm test
```

## Contributing

Make changes in `src/`, add tests in `src/**/*.spec.ts`, and open a PR describing the change.

## License

MIT

