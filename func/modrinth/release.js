import { MODRINTH_API_BASE } from "../../static";

export async function createModrinthRelease(apiToken, details, file) {
  const checkForRelease = await fetch(
    `${MODRINTH_API_BASE}/project/${details.projectId}/version`,
  );
  const checkForReleaseJson = await checkForRelease.json();
  const hasRelease = checkForReleaseJson.map((release) => {
    if (release.version_number == details.versionNumber) return true;
    else return false;
  });

  if (details.deleteOld) {
    const release = checkForReleaseJson.filter(
      (release) => release.version_number == details.versionNumber,
    )[0];
    if (release) {
      const deleteReq = await fetch(
        `${MODRINTH_API_BASE}/version/${release.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: apiToken,
          },
        },
      );
      if (deleteReq.status != 200) {
        console.log(`[MODRINTH] Filed to delete Release. ${deleteReq.statusText}`);
      }
      console.log("[MODRINTH] Successfully deleted old Release.");
    }
  } else if (hasRelease.includes(true))
    return console.log("[MODRINTH] Failed to create Release! Version exsits.");

  const data = {
    name: details.name,
    loaders: details.loaders ?? ["fabric"],
    version_type: details.versionType ?? "release",
    version_number: details.versionNumber,
    game_versions: details.gameVersions,
    changelog: details.changelog,
    project_id: details.projectId,
    file_parts: ["defaultFile"],
    primary_file: "defaultFile",
    environment: details.environment,
    dependencies: details.dependencies,
    featured: true,
  };

  const formData = new FormData();
  formData.set("data", JSON.stringify(data));
  formData.set("defaultFile", file);

  const req = await fetch(`${MODRINTH_API_BASE}/version`, {
    method: "POST",
    headers: {
      Authorization: apiToken,
    },
    body: formData,
  });
  if (req.status != 200) {
    console.log(
      `[MODRINTH] Failed to create Modrinth Version Release ${req.statusText}`,
    );
    console.log(await req.text());
  } else {
    console.log(
      `[MODRINTH] Successfully created Modrinth Version. https://modrinth.com/project/${details.projectId}/version/${details.versionNumber}`,
    );
  }
}
