import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const domainId = process.argv[2];
if (!domainId) throw new Error("Usage: npm run test:domain -- <domain-id>");
const directory = path.join(process.cwd(), "domains", domainId, "tests");
const files = (await readdir(directory)).filter((file) => file.endsWith(".test.mjs")).map((file) => path.join(directory, file));
const child = spawn(process.execPath, ["--test", ...files], { stdio: "inherit" });
child.on("exit", (code) => process.exitCode = code ?? 1);
