import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "site");
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent((request.url ?? "/").split("?")[0]);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    const filePath = path.resolve(root, relative);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) throw new Error("Not found");
    const info = await stat(filePath);
    const actualPath = info.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const content = await readFile(actualPath);
    response.writeHead(200, { "Content-Type": mime[path.extname(actualPath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

const requestedPort = Number.parseInt(process.env.PORT || "4173", 10);
const firstPort = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536 ? requestedPort : 4173;

function listenAt(port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });
}

let activePort = firstPort;
while (activePort < firstPort + 20) {
  try {
    await listenAt(activePort);
    break;
  } catch (error) {
    if (error.code !== "EADDRINUSE") {
      console.error(`Could not start the development server: ${error.message}`);
      process.exitCode = 1;
      break;
    }
    activePort += 1;
  }
}

if (server.listening) {
  const suffix = activePort === firstPort ? "" : ` (port ${firstPort} was busy)`;
  console.log(`Open Learn Core is running at http://localhost:${activePort}${suffix}`);
} else if (process.exitCode === undefined) {
  console.error(`Could not find an available port from ${firstPort} to ${activePort - 1}.`);
  process.exitCode = 1;
}
