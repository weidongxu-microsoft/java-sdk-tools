import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { spawnAsync } from "./utils/index.js";

export async function initJavaSdk(
  cwd: string,
  tspConfigUrl: string,
): Promise<CallToolResult> {
  try {
    process.chdir(cwd);

    // Run the Java SDK generation command
    const generateResult = await spawnAsync(
      "tsp-client",
      [
        "init",
        "--debug",
        "--skip-sync-and-generate",
        "--tsp-config",
        tspConfigUrl,
      ],
      {
        cwd: process.cwd(),
        shell: true, // Use shell to allow tsp-client command
        timeout: 600000, // 10 minute timeout
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
