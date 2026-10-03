import { MODRINTH_API_BASE } from "../../static";
import { getProject } from "./project";

export async function getFirstVersionForLoaderAndVersion(
  name,
  loader,
  gameVersion,
) {
  const req = await fetch(
    `${MODRINTH_API_BASE}/project/${name}/version?loaders=["${loader}"]&game_versions=["${gameVersion}"]`,
  );
  console.log(
    `Getting Latest Mod with Id ${name}: ${MODRINTH_API_BASE}/project/${name}/version?loaders=["${loader}"]&game_versions=["${gameVersion}"]`,
  );

  if (req.status != 200) return { success: false };
  const json = (await req.json())[0];
  const project = await getProject(name);

  return {
    success: true,
    fileHashes: {
      sha1: json.files[0].hashes.sha1,
      sha512: json.files[0].hashes.sha512,
    },
    client_side: project.client_side,
    server_side: project.server_side,
    fileSize: json.files[0].size,
    url: json.files[0].url,
    fileName: json.files[0].filename,
    changelog: json.changelog,
    name: json.name,
    version: gameVersion,
    releaseVersion: json.version_number,
    id: json.id,
  };
}
