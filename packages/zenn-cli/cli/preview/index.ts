import arg from "arg";
import { cliCommand } from "..";
import { build } from "./build";
import chokidar from "chokidar";
import socketIo from "socket.io";
import { PreviewHelpText } from "../constants";

export const exec: cliCommand = async (argv) => {
  const args = arg(
    {
      // Types
      "--port": Number,
      "--no-watch": Boolean,
      "--help": Boolean,

      // Alias
      "-p": "--port",
      "-h": "--help",
    },
    { argv }
  );

  const help = args["--help"];
  if (help) {
    console.log(PreviewHelpText);
    return;
  }

  const port = args["--port"] || 8000;
  const shouldWatch = !args["--no-watch"];
  const previewUrl = `http://localhost:${port}`;
  const srcDir = `${__dirname}/../../../.`; // refer ".next" dir from dist/cli/preview/index.js
  const server = await build({ port, previewUrl, srcDir });
  if (shouldWatch) {
    const watcher = chokidar.watch(`${process.cwd()}/{articles,books}/**/*`);
    const io = socketIo(server);
    watcher.on("ready", () => {
      io.on("connection", (socket) => {
        watcher.once("all", async () => {
          socket.emit("reload");
        });
      });
    });
    process.on("SIGINT", function () {
      // `Ctrl-C`の signalを奪って正常終了させる.
      io.close();
      watcher.close();
      process.exit();
    });
  }
};
