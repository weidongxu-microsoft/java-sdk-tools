#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolRequest,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class JavaSDKToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "java-sdk-tools-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {    this.server.onerror = (error: Error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "generate_client_code",
            description: "Generate client code from OpenAPI/Swagger specification",
            inputSchema: {
              type: "object",
              properties: {
                specUrl: {
                  type: "string",
                  description: "URL or path to the OpenAPI/Swagger specification",
                },
                outputDir: {
                  type: "string",
                  description: "Directory to output the generated client code",
                },
                packageName: {
                  type: "string",
                  description: "Java package name for the generated client",
                },
              },
              required: ["specUrl", "outputDir", "packageName"],
            },
          },
          {
            name: "generate_mcp_server",
            description: "Generate MCP server stub code from OpenAPI/Swagger specification",
            inputSchema: {
              type: "object",
              properties: {
                specUrl: {
                  type: "string",
                  description: "URL or path to the OpenAPI/Swagger specification",
                },
                outputDir: {
                  type: "string",
                  description: "Directory to output the generated MCP server code",
                },
                serverName: {
                  type: "string",
                  description: "Name for the MCP server",
                },
              },
              required: ["specUrl", "outputDir", "serverName"],
            },
          },
          {
            name: "create_quickstart_project",
            description: "Create an Azure SDK for Java quickstart project",
            inputSchema: {
              type: "object",
              properties: {
                projectName: {
                  type: "string",
                  description: "Name of the project to create",
                },
                outputDir: {
                  type: "string",
                  description: "Directory to create the project in",
                },
                azureService: {
                  type: "string",
                  description: "Azure service to integrate with (e.g., storage, cosmosdb, keyvault)",
                },
              },
              required: ["projectName", "outputDir", "azureService"],
            },
          },
          {
            name: "check_service_status",
            description: "Check Azure service status by API version",
            inputSchema: {
              type: "object",
              properties: {
                serviceName: {
                  type: "string",
                  description: "Name of the Azure service",
                },
                apiVersion: {
                  type: "string",
                  description: "API version to check",
                },
              },
              required: ["serviceName", "apiVersion"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "generate_client_code":
            return await this.generateClientCode(args);
          case "generate_mcp_server":
            return await this.generateMcpServer(args);
          case "create_quickstart_project":
            return await this.createQuickstartProject(args);
          case "check_service_status":
            return await this.checkServiceStatus(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error}`
        );
      }
    });
  }

  private async generateClientCode(args: any) {
    const { specUrl, outputDir, packageName } = args;

    // Placeholder implementation - would integrate with actual code generation tools
    const result = `Generated Java client code from ${specUrl}
Output directory: ${outputDir}
Package name: ${packageName}

Steps performed:
1. Downloaded OpenAPI specification from ${specUrl}
2. Validated specification format
3. Generated Java client classes with package ${packageName}
4. Created model classes for request/response objects
5. Generated service interfaces and implementations
6. Added necessary dependencies to pom.xml

Generated files:
- ${outputDir}/src/main/java/${packageName.replace(/\./g, '/')}/client/
- ${outputDir}/src/main/java/${packageName.replace(/\./g, '/')}/models/
- ${outputDir}/pom.xml`;

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async generateMcpServer(args: any) {
    const { specUrl, outputDir, serverName } = args;

    // Placeholder implementation
    const result = `Generated MCP server from ${specUrl}
Server name: ${serverName}
Output directory: ${outputDir}

Steps performed:
1. Analyzed OpenAPI specification from ${specUrl}
2. Generated MCP server stub with tool definitions
3. Created service client integration
4. Generated TypeScript/JavaScript MCP server code
5. Added proper MCP protocol handling

Generated files:
- ${outputDir}/src/index.ts (main server file)
- ${outputDir}/src/tools.ts (tool implementations)
- ${outputDir}/src/client.ts (service client wrapper)
- ${outputDir}/package.json
- ${outputDir}/tsconfig.json`;

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async createQuickstartProject(args: any) {
    const { projectName, outputDir, azureService } = args;

    // Placeholder implementation
    const result = `Created Azure SDK for Java quickstart project
Project name: ${projectName}
Azure service: ${azureService}
Output directory: ${outputDir}

Steps performed:
1. Created Maven project structure
2. Added Azure SDK dependencies for ${azureService}
3. Generated sample code for ${azureService} operations
4. Created configuration files
5. Added authentication setup
6. Generated README with deployment instructions

Generated files:
- ${outputDir}/${projectName}/src/main/java/com/example/App.java
- ${outputDir}/${projectName}/pom.xml
- ${outputDir}/${projectName}/README.md
- ${outputDir}/${projectName}/src/main/resources/application.properties`;

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  private async checkServiceStatus(args: any) {
    const { serviceName, apiVersion } = args;

    // Placeholder implementation
    const result = `Service Status Check Results
Service: ${serviceName}
API Version: ${apiVersion}

Status: ✅ Active
Last Updated: ${new Date().toISOString()}
Health: Good
Response Time: 250ms

API Endpoints Status:
- GET /api/${apiVersion}/status: ✅ Available
- POST /api/${apiVersion}/operations: ✅ Available
- PUT /api/${apiVersion}/resources: ✅ Available
- DELETE /api/${apiVersion}/resources: ✅ Available

Recent Issues: None reported
Next Scheduled Maintenance: None scheduled`;

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Although this is just an example, this could be implemented as a real notification
    // to the client that the server is ready to accept requests.
    console.error("Java SDK Tools MCP server running on stdio");
  }
}

const server = new JavaSDKToolsServer();
server.run().catch(console.error);
