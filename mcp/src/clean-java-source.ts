import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import fs from "fs";
import { basename } from "path";

export async function cleanJavaSource(
  moduleDirectory: string,
): Promise<CallToolResult> {
  if (!isManagementPlaneModule(moduleDirectory)) {
    return {
      content: [
        {
          type: "text",
          text: "The module is not a management-plane module. It is unsafe to clean the folder of a data-plane module. Java source code is not cleaned.",
        },
      ],
    };
  }

  await fs.promises.rm(`${moduleDirectory}/src/main`, {
    recursive: true,
    force: true,
  });
  await fs.promises.rm(`${moduleDirectory}/src/samples`, {
    recursive: true,
    force: true,
  });
  await fs.promises.rm(`${moduleDirectory}/src/test`, {
    recursive: true,
    force: true,
  });
  return {
    content: [
      {
        type: "text",
        text: "Java source cleaned successfully.",
      },
    ],
  };
}

export function isManagementPlaneModule(moduleDirectory: string): boolean {
  const moduleName = basename(moduleDirectory);
  return moduleName.startsWith("azure-resourcemanager-");
}
