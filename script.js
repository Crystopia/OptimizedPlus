import { checkForVersion, checkModLoader } from "./func/modrinth/project";
import { getFirstVersionForLoaderAndVersion } from "./func/modrinth/version";
import {
  buildMrPackContent,
  createMrPackFile,
  generateMrPackJson,
} from "./func/modrinth/mrpack";
import { createGitHubRelease } from "./func/github/release";
import fs from "fs";
import { createModrinthRelease } from "./func/modrinth/release";
import { MODRINTH_PROJECT_ID } from "./static";

export async function init() {
  const json = JSON.parse(fs.readFileSync("./data/versions.json"));

  Object.values(json).map((version) => {
    Object.values(version).forEach(async (versionFile, index) => {
      const versionName = Object.keys(version)[index];
      const versionData = JSON.parse(fs.readFileSync(versionFile));
      const releaseFileName = `OptimizedPlus-v${versionName}-MC.v${versionData.mcVersion}-${versionData.mcModLoader}.mrpack`;

      const contentData = await Promise.all(
        await versionData.mods.map(async (name) => {
          const versionCheck = await checkForVersion(
            name,
            versionData.mcVersion,
          );
          const modLoader = await checkModLoader(name, versionData.mcModLoader);
          if (modLoader.success && versionCheck.success)
            return await getFirstVersionForLoaderAndVersion(
              name,
              versionData.mcModLoader,
              versionData.mcVersion,
            );
        }),
      );
      const mrPackContent = await buildMrPackContent(contentData);
      const mrPackData = await generateMrPackJson(
        mrPackContent,
        versionName,
        versionData.mcVersion,
        versionData.mcModLoaderVersion,
      );

      const mrpack = await createMrPackFile(
        releaseFileName,
        mrPackData,
        versionData.configs,
      );

      const changelog = versionData.changelog
        ? fs
            .readFileSync(`./data/changelogs/${versionData.changelog}`)
            .toString("utf8")
        : `Version Release for Optimized + ${versionName} (MC: ${versionData.mcVersion} Loader: ${versionData.modLoader})`;

      if (versionData.releaseChannel.includes("github"))
        await createGitHubRelease(
          process.env.GITHUB_API_TOKEN,
          {
            deleteOld: versionData.deleteOld,
            version: versionName,
            description: changelog,
          },
          mrpack,
        );
      if (versionData.releaseChannel.includes("modrinth"))
        await createModrinthRelease(
          process.env.MODRINTH_API_TOKEN,
          {
            deleteOld: versionData.deleteOld,
            name: versionData.name,
            loaders: [versionData.mcModLoader],
            versionType: versionData.publishType,
            versionNumber: versionName,
            gameVersions: [versionData.mcVersion],
            changelog: changelog,
            projectId: MODRINTH_PROJECT_ID,
            environment: "client_only",
            dependencies: [],
            featured: true,
            status: "listed",
          },
          mrpack,
        );
    });
  });
}

init();
