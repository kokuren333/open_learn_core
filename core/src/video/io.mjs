import { readFile } from "node:fs/promises";

export async function readYamlCompatibleJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readVideoSource(filePath) {
  const source = await readYamlCompatibleJson(filePath);
  if (!source || !Array.isArray(source.slides)) throw new Error(`video source is not a JSON-compatible YAML document: ${filePath}`);
  return source;
}

export async function readPublication(filePath) {
  return readYamlCompatibleJson(filePath);
}
