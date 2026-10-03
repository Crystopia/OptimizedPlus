import { MODRINTH_API_BASE } from "../../static";

export async function getProject(name) {
  const req = await fetch(`${MODRINTH_API_BASE}/project/${name}`);
  if (req.status != 200) return { success: false };
  const json = await req.json();

  return {
    success: true,
    server_side: json.server_side,
    client_side: json.client_side,
    verions: json.game_versions,
    loaders: json.loaders,
  };
}

export async function checkForVersion(name, gameVersion) {
  const project = await getProject(name);
  if (!project.verions.includes(gameVersion)) return { success: false };

  return { success: true };
}

export async function checkModLoader(name, loader) {
  const project = await getProject(name);
  if (!project.loaders.includes(loader)) return { success: false };

  return { success: true };
}
