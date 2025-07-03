#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateJavaSdk } from "./generate-java-sdk.js";
import { clientNameUpdateCookbook } from "./client-name-update.js";
import { brownfieldMigration } from "./brownfield-migrate.js";
import { initJavaSdk } from "./init-java-sdk.js";
import { prepareJavaSdkEnvironmentCookbook } from "./prepare-environment.js";
import { buildJavaSdk } from "./build-java-sdk.js";
import { getJavaSdkChangelog } from "./java-sdk-changelog.js";
import { cleanJavaSource } from "./clean-java-source.js";

// Create the MCP server
const server = new McpServer({
  name: "java-sdk-tools-server",
  version: "1.0.0",
});

// Setup logging function
const logToolCall = (toolName: string) => {
  const logMsg = `[${new Date().toISOString()}] [MCP] Tool called: ${toolName}\n`;
  process.stderr.write(logMsg);
};

// Register init_java_sdk tool
server.registerTool(
  "init_java_sdk",
  {
    description:
      "Initialize the tsp-location.yaml for Java SDK, from URL to tspconfig.yaml. Ask the user for the url to tspconfig.yaml. url is something like: https://github.com/Azure/azure-rest-api-specs/blob/dee71463cbde1d416c47cf544e34f7966a94ddcb/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml.",
    inputSchema: {
      cwd: z
        .string()
        .describe("The absolute path to the directory of the workspace"),
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

// Register clean_java_source tool
server.registerTool(
  "clean_java_source",
  {
    description: "Initiate and generate Java SDK from URL to tspconfig.yaml",
    inputSchema: {
      moduleDirectory: z
        .string()
        .describe("The absolute path to the directory of the Java SDK"),
    },
    annotations: {
      title: "Clean Java Source",
    },
  },
  async (args) => {
    logToolCall("clean_java_source");
    const result = await cleanJavaSource(args.moduleDirectory);
    return result;
  },
);

// Register build_java_sdk tool
server.registerTool(
  "build_java_sdk",
  {
    description: "Build the Java SDK for groupId that starts with `com.azure`.",
    inputSchema: {
      cwd: z
        .string()
        .describe("The absolute path to the directory of the workspace"),
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
      "The instructions for generating Java SDK after migrating from Swagger to TypeSpec",
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
      "Generate or update Java SDK from configuration in tsp-location.yaml for a target service, make sure there is already a tsp-location.yaml in the service submodule directory, if not, ask to initialize java sdk first. And make sure there is a directory named 'TempTypeSpecFiles' in the service submodule directory, if the directory is not present, tell the user to synchronize the TypeSpec source for Java SDK first.",
    inputSchema: {
      moduleDirectory: z
        .string()
        .describe(
          "The absolute path to the directory containing tsp-location.yaml",
        ),
      rootDirectory: z
        .string()
        .describe(
          "The absolute path to the azure-sdk-for-java directory, where the moduleDirectory is a submodule of it",
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
    inputSchema: {},
    annotations: {
      title: "Update Client Name",
    },
  },
  async () => {
    logToolCall("update_client_name");
    const result = await clientNameUpdateCookbook();
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
