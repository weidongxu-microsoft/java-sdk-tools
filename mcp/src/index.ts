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
          case "generate_java_sdk":
            return await this.generateJavaSdk(args ?? {});
          case "client_name_update_cookbook": {
            const safeArgs = args ?? {};
            if (typeof safeArgs.oldName !== "string" || typeof safeArgs.newName !== "string") {
              throw new McpError(
                ErrorCode.InvalidParams,
                `Both 'oldName' and 'newName' parameters must be provided as strings.`
              );
            }
            return await this.clientNameUpdateCookbook(safeArgs.oldName, safeArgs.newName);
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
  private async generateJavaSdk(args: any) {
    const { cwd } = args;
    try {
      process.chdir(cwd);

      // Run the Java SDK generation command
      const generateResult = await spawnAsync('tsp-client', ['update', '--debug', '--save-inputs'], {
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

 private async clientNameUpdateCookbook(oldName: string, newName: string) {
    const cookbook = `
    Follow below instruction to update old client name to new client name in both client.tsp and the generated Java SDK.

# How to Update the Client Name in the Generated Java SDK

1. **Look at all \`.tsp\` files under folder 'TempTypeSpecFiles' and get the path of the Model or Operation or operation parameter declaration with ${oldName}**

   Look for the model or operation you want to rename under '.tsp' files. Get the path of the model or operation. For example, model \`OldModelName\`'s path is 'Azure.Communication.MessagesService.OldModelName', operation 'sendMessage''s path is 'Azure.Communication.MessagesService.AdminOperations.sendMessage'.
   \`\`\`typespec
   namespace Azure.Communication.MessagesService;

   model OldModelName {
    // model properties
   }

   interface AdminOperations {
      @path("/messages")
      operation sendMessage(@body message: OldModelName): void;
    }
   \`\`\`


3. **Update client.tsp**

   Use and founded path and @clientName decorator to update the client name to ${newName}. 
   For example, for model \`OldModelName\`, you can add below line to \`NewModelName\` to client.tsp like this. Update operation name or operation parameter name are similar.
   \`\`\`typespec
   
  @@clientName(Azure.Communication.MessagesService.OldModelName,
    "NewModelName",
    "java"
  );
   \`\`\`

5. **Regenerate the SDK**

   Find the directory in the workspace that contains 'tsp-location.yaml'. Run your SDK generation command\`tsp-client generate\` in this directory to regenerate the Java SDK with the updated model name.

6. **Update Downstream Code**

   If you have already generated code or documentation that references the old model name, update those references as well.

---

**Tip:** Use your IDE’s “rename symbol” or “find and replace” feature to ensure you update all references safely.
    `;

    console.error(`Generated client name update cookbook:\n${cookbook}`);

    return {
      content: [
        {
          type: "text",
          text: cookbook,
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
