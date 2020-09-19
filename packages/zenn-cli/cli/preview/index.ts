import arg from "arg";
import { cliCommand } from "..";
import { build } from "./build";
import chokidar from "chokidar";
import socketIo from "socket.io";

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
  if (watch) {
    const watcher = chokidar.watch(`${process.cwd()}/{articles,books}/**/*`);
    const io = socketIo(server);
    watcher.once("ready", () => {
      io.on("connection", (socket) => {
        watcher.once("all", async () => {
          socket.emit("reload");
        });
      });
    });
  }
};
