import { spawnAsync } from "./utils/index.js";
import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";

const MAVEN_HOST = "https://repo1.maven.org/maven2/";
const MAVEN_URL =
  MAVEN_HOST +
  "/{group_id}/{artifact_id}/{version}/{artifact_id}-{version}.jar";

export async function getJavaSdkChangelog(
  cwd: string,
  jarPath: string,
  groupId: string,
  artifactId: string,
): Promise<any> {
  let tempDir: string | null = null;

  try {
    const xmlParser = new XMLParser({ ignoreAttributes: false });
    const mvnCmd = process.platform === "win32" ? "mvn.cmd" : "mvn";

    // Create temporary directory in system temp folder
    tempDir = await mkdtemp(join(tmpdir(), "java-sdk-changelog-"));

    const groupIdPath = groupId.replace(/\./g, "/");
    const metadataUrl = `${MAVEN_HOST}${groupIdPath}/${artifactId}/maven-metadata.xml`;
    const metadataResponse = await axios.get(metadataUrl);
    const metadataXml = xmlParser.parse(metadataResponse.data);
    // take latest stable version, if none, take latest (beta) version
    let releasedSdkVersion = metadataXml.metadata.versioning.latest;
    const versions: string[] =
      metadataXml.metadata.versioning.versions.version.reverse();
    for (const version of versions) {
      if (!version.includes("-beta")) {
        releasedSdkVersion = version;
        break;
      }
    }
    // download JAR
    const jarFileName = `${artifactId}-${releasedSdkVersion}.jar`;
    const jarUrl = `${MAVEN_HOST}${groupIdPath}/${artifactId}/${releasedSdkVersion}/${jarFileName}`;
    const jarResponse = await axios.get(jarUrl, {
      responseType: "arraybuffer",
    });
    const releasedJarFilePath = join(tempDir, jarFileName);
    const buffer = Buffer.from(jarResponse.data);
    await fs.promises.writeFile(releasedJarFilePath, buffer, { flag: "w" });

    // run changelog
    const changelogResult = await spawnAsync(
      mvnCmd,
      [
        "--no-transfer-progress",
        "clean",
        "package",
        "exec:java",
        "-q",
        "-f",
        cwd + "/eng/automation/changelog/pom.xml",
        `-DOLD_JAR="${releasedJarFilePath}"`,
        `-DNEW_JAR="${jarPath}"`,
      ],
      {
        cwd: process.cwd(),
        shell: true, // Use shell to allow tsp-client command
        timeout: 600000, // 10 minute timeout
      },
    );
    const changelogOutput = changelogResult.stdout;

    // TODO: Add your changelog generation logic here
    // Use tempDir for any temporary files needed during processing

    // Placeholder return for now
    return {
      content: [
        {
          type: "text",
          text: changelogOutput,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Unexpected error during SDK changelog: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(
          `Failed to clean up temporary directory: ${tempDir}`,
          cleanupError,
        );
      }
    }
  }
}
