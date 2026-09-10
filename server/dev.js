import { spawn } from "node:child_process";

const startScript = (script) =>
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", "npm", "run", script], {
        stdio: "inherit",
      })
    : spawn("npm", ["run", script], { stdio: "inherit" });

const processes = ["server", "client"].map(startScript);

const stop = () => processes.forEach((process) => process.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
