import { GITHUB_API_BASE, REPO_NAME, REPO_OWNER } from "../../static";

export async function createGitHubRelease(apiToken, details, file) {
  const checkForRelease = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases`,
  );
  const checkForReleaseJson = await checkForRelease.json();
  const hasRelease = checkForReleaseJson.map((release) => {
    if (release.tag_name == details.version) return true;
    else return false;
  });
  if (hasRelease.includes(true)) return console.log("[GITHUB] Failed to create Release! Version exsits.");

  const req = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        tag_name: details.version,
        name: `Optimized + ${details.version}`,
        body: details.description,
      }),
    },
  );

  if (req.status != 201) {
    console.log(`Failed with status ${req.statusText}`);
  } else {
    const json = await req.json();
    console.log(`Created Release ${json.url}`);

    const asset = await fetch(
      `https://uploads.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/${json.id}/assets?name=${file.name}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: file,
      },
    );

    if (asset.status != 201) {
      console.log(`Failed to create a Release Asset! ${asset.statusText}`);
      console.log(`Error: ${await asset.text()}`);
    } else {
      console.log(`Uploaded a release Asset!`);
    }
  }
}
