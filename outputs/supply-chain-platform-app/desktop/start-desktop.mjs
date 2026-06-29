import { spawn } from "node:child_process";
import http from "node:http";

const appUrl = "http://127.0.0.1:3001";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
let nextProcess;

function isReady() {
  return new Promise((resolve) => {
    const req = http.get(appUrl, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForApp() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("SupplyOS web app did not become ready on http://127.0.0.1:3001");
}

async function main() {
  if (!(await isReady())) {
    nextProcess = spawn(npmCommand, ["run", "dev"], {
      stdio: "inherit"
    });
  }

  await waitForApp();

  const electronProcess = spawn(npmCommand, ["run", "desktop:electron"], {
    env: { ...process.env, SUPPLYOS_APP_URL: appUrl },
    stdio: "inherit"
  });

  electronProcess.on("exit", (code) => {
    if (nextProcess) nextProcess.kill();
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error.message);
  if (nextProcess) nextProcess.kill();
  process.exit(1);
});
