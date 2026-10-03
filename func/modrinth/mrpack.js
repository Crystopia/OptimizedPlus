import JSZip from "jszip";
import fs from "fs";

export async function buildMrPackContent(files) {
  return files.map((file) => {
    if (file != undefined && file.success)
      return {
        downloads: [file.url],
        env: { client: file.clientSide, server: file.serverSide },
        fileSize: file.fileSize,
        hashes: {
          sha1: file.fileHashes.sha1,
          sha512: file.fileHashes.sha512,
        },
        path: `mods/${file.fileName}`,
      };
  });
}

export async function generateMrPackJson(
  filesJson,
  releaseVersion,
  mcVersion,
  loaderVersion,
) {
  return {
    dependencies: {
      "fabric-loader": loaderVersion,
      minecraft: mcVersion,
    },
    files: filesJson.filter((f) => f != null && f != undefined),
    formatVersion: 1,
    game: "minecraft",
    name: `Optimized + - ${releaseVersion}`,
    versionId: releaseVersion,
  };
}

export async function createMrPackFile(fileName, json, configDir) {
  const zip = new JSZip();
  zip.file("modrinth.index.json", JSON.stringify(json));
  const configs = fs.readdirSync(`./data/configs/${configDir}/`, {
    recursive: true,
  });
  configs.forEach((file) => {
    if (!file.includes(".")) return;
    zip.file(
      `overrides/${file}`,
      fs.readFileSync(`./data/configs/${configDir}/${file}`),
    );
  });

  const zipFile = await zip.generateAsync({ type: "blob" });

  console.log(`[MRPACK] Created a .mrpack file for ModPack.`);
  return new File(await zipFile.arrayBuffer(), fileName);
}
