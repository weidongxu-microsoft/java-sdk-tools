import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { checkFileExistence, spawnAsync } from "./utils/index.js";
import { join } from "path";
import { rm } from "fs/promises";

export async function generateJavaSdk(
  typespecSourceDirectory: string,
): Promise<CallToolResult> {
  try {
    process.chdir(typespecSourceDirectory);

    // Determine the TypeSpec source file to use
    const tspSource = (await checkFileExistence(
      join(typespecSourceDirectory, "client.tsp"),
    ))
      ? "client.tsp"
      : "main.tsp";

    // Update dependencies to latest
    // This step is to make sure the packages here are compatible with the typespec-java emitter (to be installed in next step)
    await spawnAsync(
      "ncu",
      ["-u"],
      {
        cwd: process.cwd(),
        shell: true,
        timeout: 600000,
      },
    );

    // Install latest typespec-java emitter
    const installEmitterResult = await spawnAsync(
      "npm",
      ["install", "@azure-tools/typespec-java@latest", "--force"],
      {
        cwd: process.cwd(),
        shell: true,
        timeout: 600000,
      },
    );

    // Delete the existing java-sdk folder
    const javaSdkExists = await checkFileExistence(
      join(typespecSourceDirectory, "java-sdk"),
    );
    if (javaSdkExists) {
      await rm(join(typespecSourceDirectory, "java-sdk"), {
        recursive: true,
        force: true,
      });
    }

    // Run the Java SDK generation command
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
