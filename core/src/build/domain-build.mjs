export function publishDirectory(manifest, distRoot) {
  const publishPath = manifest.publish?.path ?? manifest.id;
  return `${distRoot}/${publishPath}`.replaceAll("\\", "/");
}

export function portalEntry(manifest) {
  return {
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    version: manifest.version,
    status: manifest.status,
    path: manifest.publish?.path ?? manifest.id,
  };
}
