import path from "path";
import * as fs from "fs";

export async function findAzureSdkRoot(
  moduleDirectoryPath: string,
): Promise<string> {
  let currentDir = path.dirname(moduleDirectoryPath);
  while (currentDir !== path.dirname(currentDir)) {
    // pom.xml, sdk and eng directories are expected at the root of the Azure SDK for Java
    if (
      (await checkFileExistence(path.join(currentDir, "pom.xml"))) &&
      (await checkFileExistence(path.join(currentDir, "sdk"))) &&
      (await checkFileExistence(path.join(currentDir, "eng")))
    ) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached the root directory
    }
    currentDir = parentDir;
  }
  throw new Error(
    `Azure SDK root not found from module directory: ${moduleDirectoryPath}`,
  );
}

export async function findModuleDirectory(dir: string): Promise<string> {
  let currentDir = path.dirname(dir);
  while (currentDir !== path.dirname(currentDir)) {
    // pom.xml, src directory are expected at the directory of the Azure SDK for Java module
    if (
      (await checkFileExistence(path.join(currentDir, "pom.xml"))) &&
      (await checkFileExistence(path.join(currentDir, "src")))
    ) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached the root directory
    }
    currentDir = parentDir;
  }
  throw new Error(`Azure SDK module not found from source: ${dir}`);
}

export async function checkFileExistence(filePath: string): Promise<boolean> {
  try {
    await fs.promises.stat(filePath);
    return true;
  } catch (error) {
    if (error) {
      return false;
    } else {
      return false;
    }
  }
}
