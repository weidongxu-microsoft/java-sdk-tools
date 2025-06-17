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
import { spawnAsync, execAsync, ProcessResult } from './utils/index.js';

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

  private setupErrorHandling(): void {   
    this.server.onerror = (error: Error) => {
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
            name: "generate_java_sdk",
            description: "Generate Java SDK from configuration in tsp-location.yaml in this directory",
            inputSchema: {
              type: "object",
              properties: {
                cwd: {
                  type: "string",
                  description: "The absolute path to the directory containing tsp-location.yaml",
                },
              },
              required: ["cwd"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "generate_java_sdk":
            return await this.generateJavaSdk(args);
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
  private async generateJavaSdk(args: any) {
    const { cwd } = args;
    try {
      process.chdir(cwd);

      // Run the Java SDK generation command
      const generateResult = await spawnAsync('tsp-client', ['update', '--debug'], {
        cwd: process.cwd(),
        shell: true, // Use shell to allow tsp-client command
        timeout: 600000 // 10 minute timeout
      });

      let result = `Java SDK Generation Results:\n\n`;
      
      if (generateResult.success) {
        result += `✅ SDK generation completed successfully!\n\n`;
        result += `Output:\n${generateResult.stdout}\n`;
        
        if (generateResult.stderr) {
          result += `\nWarnings/Info:\n${generateResult.stderr}\n`;
        }
      } else {
        result += `❌ SDK generation failed with exit code ${generateResult.exitCode}\n\n`;
        
        if (generateResult.stdout) {
          result += `Output:\n${generateResult.stdout}\n`;
        }
        
        if (generateResult.stderr) {
          result += `\nErrors:\n${generateResult.stderr}\n`;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Unexpected error during SDK generation: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
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
