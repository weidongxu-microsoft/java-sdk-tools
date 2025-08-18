import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { checkFileExistence, spawnAsync } from "./utils/index.js";
import { join } from "path";

export async function generateJavaSdk(
  typespecSourceDirectory: string,
): Promise<CallToolResult> {
  try {
    process.chdir(typespecSourceDirectory);

    const tspSource = (await checkFileExistence(
      join(typespecSourceDirectory, "client.tsp"),
    ))
      ? "client.tsp"
      : "main.tsp";

    // Run the Java SDK generation command
    const installEmitterResult = await spawnAsync(
      "npm",
      ["install", "@azure-tools/typespec-java@latest"],
      {
        cwd: process.cwd(),
        shell: true,
        timeout: 600000,
      },
    );

    const generateResult = await spawnAsync(
      "tsp",
      [
        "compile",
        tspSource,
        '--emit="@azure-tools/typespec-java"',
        '--option="@azure-tools/typespec-java.emitter-output-dir={project-root}/java-sdk"',
      ],
      {
        cwd: process.cwd(),
        shell: true,
        timeout: 600000,
      },
    );

    let result = `Java SDK Generation Results:\n\n`;

    if (generateResult.success) {
      result += `✅ SDK generation completed successfully!\n\n`;
    } else {
      result += `❌ SDK generation failed with exit code ${generateResult.exitCode}\n\n`;

      if (generateResult.stdout) {
        result += `Output:\n${generateResult.stdout}\n`;
      }

      if (generateResult.stderr) {
        result += `\nErrors:\n${generateResult.stderr}\n`;
      }

      result += `\nPlease check the above output for details on the failure. If it complains missing Java environment, please ask for preparing environment.\n`;
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
