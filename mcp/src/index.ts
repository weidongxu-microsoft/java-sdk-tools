#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { generateJavaSdk } from "./generate-java-sdk.js";
import { clientNameUpdateCookbook } from "./client-name-update.js";
import { brownfieldMigration } from "./brownfield-migrate.js";
import { initJavaSdk } from "./init-java-sdk.js";
import { prepareJavaSdkEnvironmentCookbook } from "./prepare-environment.js";
import { buildJavaSdk } from "./build-java-sdk.js";
import { getJavaSdkChangelog } from "./java-sdk-changelog.js";

// Create the MCP server
const server = new McpServer({
  name: "java-sdk-tools-server",
  version: "1.0.0",
});

// Setup logging function
const logToolCall = (toolName: string) => {
  const logMsg = `[${new Date().toISOString()}] [MCP] Tool called: ${toolName}\n`;
  try {
    const logPath = path.resolve(process.cwd(), "mcp-server.log");
    fs.appendFileSync(logPath, logMsg, { encoding: "utf8" });
  } catch (logErr) {
    console.error("Failed to write to mcp-server.log:", logErr);
  }
  process.stderr.write(logMsg);
};

// Register init_java_sdk tool
server.registerTool(
  "init_java_sdk",
  {
    description: "Initiate and generate Java SDK from URL to tspconfig.yaml",
    inputSchema: {
      cwd: z
        .string()
        .describe("The absolute path to the directory of the workspace root"),
      tspConfigUrl: z.string().describe("The URL to the tspconfig.yaml file"),
    },
    annotations: {
      title: "Initialize Java SDK",
    },
  },
  async (args) => {
    logToolCall("init_java_sdk");
    const result = await initJavaSdk(args.cwd, args.tspConfigUrl);
    return result;
  },
);

// Register build_java_sdk tool
server.registerTool(
  "build_java_sdk",
  {
    description: "Build the Java SDK for groupId that starts with `com.azure`",
    inputSchema: {
      cwd: z
        .string()
        .describe("The absolute path to the directory of the workspace root"),
      moduleDirectory: z
        .string()
        .describe("The absolute path to the directory of the Java SDK"),
      groupId: z.string().describe("The group ID for the Java SDK"),
      artifactId: z.string().describe("The artifact ID for the Java SDK"),
    },
    annotations: {
      title: "Build Java SDK",
    },
  },
  async (args) => {
    logToolCall("build_java_sdk");
    const result = await buildJavaSdk(
      args.cwd,
      args.moduleDirectory,
      args.groupId,
      args.artifactId,
    );
    return result;
  },
);

// Register get_java_sdk_changelog tool
server.registerTool(
  "get_java_sdk_changelog",
  {
    description:
      "Get the changelog for the Java SDK for groupId that starts with `com.azure`",
    inputSchema: {
      cwd: z
        .string()
        .describe("The absolute path to the directory of the workspace root"),
      jarPath: z
        .string()
        .describe(
          "The absolute path to the JAR file of the Java SDK. It should be under the `target` directory of the Java SDK module.",
        ),
      groupId: z.string().describe("The group ID for the Java SDK"),
      artifactId: z.string().describe("The artifact ID for the Java SDK"),
    },
    annotations: {
      title: "Get Java SDK Changelog",
    },
  },
  async (args) => {
    logToolCall("get_java_sdk_changelog");
    const result = await getJavaSdkChangelog(
      args.cwd,
      args.jarPath,
      args.groupId,
      args.artifactId,
    );
    return result;
  },
);

// Register instruction_migrate_typespec tool
server.registerTool(
  "instruction_migrate_typespec",
  {
    description:
      "The instructions for migrating Java SDK to generate from TypeSpec",
    inputSchema: {},
    annotations: {
      title: "Migration Instructions",
    },
  },
  async () => {
    logToolCall("instruction_migrate_typespec");
    const result = await brownfieldMigration();
    return result;
  },
);

// Register sync_java_sdk tool
server.registerTool(
  "sync_java_sdk",
  {
    description:
      "Synchronize/Download the TypeSpec source for Java SDK, from configuration in tsp-location.yaml",
    inputSchema: {
      cwd: z
        .string()
        .describe(
          "The absolute path to the directory containing tsp-location.yaml",
        ),
    },
    annotations: {
      title: "Sync Java SDK",
    },
  },
  async (args) => {
    logToolCall("sync_java_sdk");
    const result = await generateJavaSdk(args.cwd, false);
    return result;
  },
);

// Register generate_java_sdk tool
server.registerTool(
  "generate_java_sdk",
  {
    description:
      "Generate Java SDK, from configuration in tsp-location.yaml, make sure there is already a directory named 'TempTypeSpecFiles' in the current working directory, if the directory is not present, Tell the user to synchronize the TypeSpec source for Java SDK first.",
    inputSchema: {
      cwd: z
        .string()
        .describe(
          "The absolute path to the directory containing tsp-location.yaml",
        ),
    },
    annotations: {
      title: "Generate Java SDK",
    },
  },
  async (args) => {
    logToolCall("generate_java_sdk");
    const result = await generateJavaSdk(args.cwd, true);
    return result;
  },
);

// Register update_client_name tool
server.registerTool(
  "update_client_name",
  {
    description:
      "Update client name for both client.tsp and the generated java sdk. Follow the returned instruction to update old client name to new client name, be sure to ask for old client name and new client name. e.g. MediaMessageContent.mediaUri to MediaMessageContent.mediaUrl",
    inputSchema: {
      oldName: z.string().describe("The old client name to be updated."),
      newName: z.string().describe("The new client name to use."),
    },
    annotations: {
      title: "Update Client Name",
    },
  },
  async (args) => {
    logToolCall("update_client_name");
    const result = await clientNameUpdateCookbook(args.oldName, args.newName);
    return result;
  },
);

// Register prepare_java_sdk_environment tool
server.registerTool(
  "prepare_java_sdk_environment",
  {
    description:
      "Get step-by-step instructions to prepare the environment for Java SDK generation, including setting up directories, dependencies, and configuration files",
    inputSchema: {
      cwd: z
        .string()
        .describe(
          "The absolute path to the working directory where the environment should be prepared",
        ),
    },
    annotations: {
      title: "Prepare Java SDK Environment",
    },
  },
  async (args) => {
    logToolCall("prepare_java_sdk_environment");
    const result = await prepareJavaSdkEnvironmentCookbook(args.cwd);
    return result;
  },
);

// Setup error handling
server.server.onerror = (error: Error) => {
  console.error("[MCP Error]", error);
};

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Java SDK Tools MCP server running on stdio");
}

main().catch(console.error);
