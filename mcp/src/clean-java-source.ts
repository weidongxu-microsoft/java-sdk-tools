import fs from "fs";

export async function cleanJavaSource(moduleDirectory: string): Promise<any> {
  await fs.promises.rmdir(`${moduleDirectory}/src/main`, { recursive: true });
  await fs.promises.rmdir(`${moduleDirectory}/src/samples`, {
    recursive: true,
  });
  await fs.promises.rmdir(`${moduleDirectory}/src/test`, { recursive: true });

  return {
    content: [
      {
        type: "text",
        text: "Java source cleaned successfully.",
      },
    ],
  };
}
