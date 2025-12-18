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
        "<directory_of_cloned_repository>/mcp/azure-sdk-java-mcp.ps1"
      ],
      "type": "stdio",
      "version": "1.0.0"
    }
  },
  "inputs": []
}
```

## TypeSpec Migration PR Review

This tool is typically used during TypeSpec Migration PR Review

When reviewing TypeSpec migration PR, and its impact on Java SDK. It is recommended to
1. Open the `apiview`, compare it with latest GA SDK, review the API in clients. Some of the breaks may be expected, like fixing of pageable or LRO.
   <img width="1851" height="440" alt="image" src="https://github.com/user-attachments/assets/cdcd64a2-08e1-48c6-9455-b9e2262fd2f9" />

1. Run this tool to mitigate model/property naming, like `URL` -> `Url`, `IP` -> `Ip`, etc.
1. Review the change made by the tool. Some of the change may "fix" a break, but that break might be the correct thing to do (e.g. service fixing a wrong Swagger definition, usually a wrong type). Do not blindly trust `@@alternateType` added by the tool.
1. If things look good, update it in [Validation for for Swagger spec migration to TypeSpec](https://github.com/Azure/autorest.java/issues/3160).

## Usage

It is recommended to put the "main.tsp" or "client.tsp" in "azure-rest-api-specs" repository as context. They are the TypeSpec source for the Java SDK.
"azure-sdk-for-java" repository is not required.

It is recommended to use coding LLM like GPT5-Codex or Claude.

Ask agent to "mitigate Java breaking changes from TypeSpec". If agent does not find the right tool, you can use the `#mitigateBreaks` tool directly, and confirm to let agent take actions.

Tips:
- It may help to disable the "azure-sdk-mcp" tool, if the workspace is in repository root.
- Let the agent run full-auto, by choosing "Allow in this Workspace" upon Copilot permission request, or disable the confirmation altogether.
    ```json
      "chat.tools.global.autoApprove": true,
      "chat.tools.terminal.autoApprove": {
        "/.*/": true
      }
    ```

The instruction asks agent to commit the change to "client.tsp" and "tspconfig.yaml".
The `generateJavaSdk` tool modifies root "package.json", and generates code in "java-sdk" folder. Do not commit these files.

## Prerequisite

- [Node.js](https://nodejs.org/en/download/) 22 or above. (Verify by running `node --version`)
- [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) installed globally via `npm install -g npm-check-updates`
- [Java](https://docs.microsoft.com/java/openjdk/download) 11 or above. (Verify by running `javac --version`)
- [Maven](https://maven.apache.org/download.cgi). (Verify by running `mvn --version`)

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

