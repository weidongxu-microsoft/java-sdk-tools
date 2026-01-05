import path from "path";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

export async function brownfieldMigration(): Promise<CallToolResult> {
  // The js file is under "dist" folder
  const mcpRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const instructionsMdPath = path.resolve(
    mcpRoot,
    "assets",
    "migrate-instructions.md",
  );

  const instructions = await readFile(instructionsMdPath, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: instructions,
      },
    ],
  };
}
