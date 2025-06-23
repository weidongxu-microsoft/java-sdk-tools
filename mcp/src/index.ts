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
import { saveTypeSpecChanges } from "./save-typespec-changes.js";

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
            name: "sync_java_sdk",
            description: "Synchronize/Download the TypeSpec source for Java SDK, from configuration in tsp-location.yaml",
            inputSchema: {
              type: "object",
              properties: {
                tspLocationPath: {
                  type: "string",
                  description: "The absolute path to the tsp-location.yaml file",
                },
              },
              required: ["tspLocationPath"],
            },
          },
          {
            name: "generate_java_sdk",
            description: "Generate Java SDK, from configuration in tsp-location.yaml, make sure there is already a directory named 'TempTypeSpecFiles' in the current working directory, if the directory is not present, Tell the user to synchronize the TypeSpec source for Java SDK first.",
            inputSchema: {
              type: "object",
              properties: {
                tspLocationPath: {
                  type: "string",
                  description: "The absolute path to the tsp-location.yaml file",
                },
              },
              required: ["tspLocationPath"],
            },
          },
          {
            name: "update_client_name",
            description: "Update client name for both client.tsp and the generated java sdk. Follow the returned instruction to update old client name to new client name, be sure to ask for old client name and new client name. e.g. MediaMessageContent.mediaUri to MediaMessageContent.mediaUrl",
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
            name: "save_typespec_changes",
            description: "Follow the returned instructions to save TypeSpec changes. Be sure to ask for the local absolute path to the azure-rest-api-specs project, pass it to property 'specRepoPath'. If no local project path, ask to provide a directory to clone the repo, pass it to property 'cloneWorkspace'.",
            inputSchema: {
              type: "object",
              properties: {
                specRepoPath: {
                  type: "string",
                  description: "The absolute path to the TypeSpec repository where changes should be committed."
                },
                cloneWorkspace: {
                  type: "string",
                  description: "The absolute path to the directory where the azure-rest-api-specs repository should be cloned if not present."
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
          case "sync_java_sdk":
            return await generateJavaSdk(args ?? {});

          case "generate_java_sdk":
            return await generateJavaSdk(args ?? {});

          case "update_client_name": {
            const safeArgs = args ?? {};
            if (typeof safeArgs.oldName !== "string" || typeof safeArgs.newName !== "string") {
              throw new McpError(
                ErrorCode.InvalidParams,
                `Both 'oldName' and 'newName' parameters must be provided as strings.`
              );
            }
            return await clientNameUpdateCookbook(safeArgs.oldName, safeArgs.newName);
          }

          case "save_typespec_changes": {
            // Pass both parameters, both are optional
            const specRepoPath = args && typeof args.specRepoPath === "string" && args.specRepoPath.trim() !== "" ? args.specRepoPath : undefined;
            const cloneWorkspace = args && typeof args.cloneWorkspace === "string" && args.cloneWorkspace.trim() !== "" ? args.cloneWorkspace : undefined;
            return await saveTypeSpecChanges({ specRepoPath, cloneWorkspace });
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
