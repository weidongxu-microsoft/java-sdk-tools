import path from "path";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { readFile } from "fs/promises";

export async function brownfieldMigration(): Promise<CallToolResult> {
  // The js file is under "dist" folder
  const mcpRoot = path.dirname(__dirname);
  const instructionsMdPath = path.resolve(mcpRoot, "assets", "instructions.md");

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
