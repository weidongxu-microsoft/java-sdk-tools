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
import { generateJavaSdk } from "./generate-java-sdk.js";
import { clientNameUpdateCookbook } from "./client-name-update.js";
import * as fs from 'fs';
import * as path from 'path';

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
            name: "update_java_sdk",
            description: "Update the source and generate Java SDK from configuration in tsp-location.yaml in this directory",
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
          {
            name: "client_name_update_cookbook",
            description: "follow the returned instruction to update old client name to new client name in both client.tsp and the generated Java SDK, be sure to ask for old client name and new client name",
            inputSchema: {
              type: "object",
              properties: {
                oldName: {
                  type: "string",
                  description: "The old client name to be updated."
                },
                newName: {
                  type: "string",
                  description: "The new client name to use."
                }
              },
              required: ["oldName", "newName"],
            },
          },
          {
            name: "commit_typespec_changes_instructions",
            description: "follow the returned instructions to commit TypeSpec changes using git. Ask for the optional lcoal absolute path to the azure-rest-api-spec project and set it to parameter 'specRepoPath'. If no local project, ask user to provide the directory to clone azure-rest-api-spec project, set it to parameter 'cloneWorkspace'.",
            inputSchema: {
              type: "object",
              properties: {
                specRepoPath: {
                  type: "string",
                  description: "The absolute path to the TypeSpec repository where changes should be committed."
                },
                cloneWorkspace: {
                  type: "string",
                  description: "The absolute path to the workspace path to clone TypeSpec repository."
                }
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        const logMsg = `[${new Date().toISOString()}] [MCP] Tool called: ${name}\n`;
        // Write to log file
        try {
          const logPath = path.resolve(process.cwd(), 'mcp-server.log');
          fs.appendFileSync(logPath, logMsg, { encoding: 'utf8' });
        } catch (logErr) {
          // fallback to console if file write fails
          console.error('Failed to write to mcp-server.log:', logErr);
        }
        // Also log to stderr for environments that support it
        process.stderr.write(logMsg);

        switch (name) {
          case "update_java_sdk":
            return await generateJavaSdk(args ?? {}, false);

          case "generate_java_sdk":
            return await generateJavaSdk(args ?? {}, true);

          case "client_name_update_cookbook": {
            const safeArgs = args ?? {};
            if (typeof safeArgs.oldName !== "string" || typeof safeArgs.newName !== "string") {
              throw new McpError(
                ErrorCode.InvalidParams,
                `Both 'oldName' and 'newName' parameters must be provided as strings.`
              );
            }
            return await clientNameUpdateCookbook(safeArgs.oldName, safeArgs.newName);
          }
          case "commit_typespec_changes_instructions": {
            const repoPath = args && typeof args.specRepoPath === "string" && args.specRepoPath.trim() !== "" ? args.specRepoPath : process.cwd();
            return await this.commitTypespecChangesInstructions({ specRepoPath: repoPath });
          }
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
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
