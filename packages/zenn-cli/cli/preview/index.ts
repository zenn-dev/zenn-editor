import arg from "arg";
import { cliCommand } from "..";
import { build } from "./build";
import chokidar from "chokidar";
import socketIo from "socket.io";
import open from "open";

export const exec: cliCommand = async (argv) => {
  const args = arg(
    {
      // Types
      "--port": Number,

      // Alias
      "-p": "--port",

      // Types
      "--watch": Boolean,

      // Alias
      "-w": "--watch",
    },
    { argv }
  );

  const port = args["--port"] || 8000;
  const watch = args["--watch"] ?? true;
  const previewUrl = `http://localhost:${port}`;
  const srcDir = `${__dirname}/../../../.`; // refer ".next" dir from dist/cli/preview/index.js
  const server = await build({ port, previewUrl, srcDir });
  await open(previewUrl);
  if (watch) {
    const watcher = chokidar.watch(process.cwd());
    const io = socketIo(server);
    watcher.on("ready", () => {
      io.on("connection", (socket) => {
        watcher.on("all", async (_, path) => {
          if (/articles|books/.test(path)) {
            socket.emit("reload");
          }
        });
      });
    });
  }
};
