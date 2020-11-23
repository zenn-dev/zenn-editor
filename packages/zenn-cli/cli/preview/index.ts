import arg from "arg";
import { cliCommand } from "..";
import { build } from "./build";
import chokidar from "chokidar";
import socketIo from "socket.io";
import { invalidOption, previewHelpText } from "../constants";
import colors from "colors/safe";


function parseArgs(argv: string[]|undefined) {
  try {
    return arg(
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
  } catch (e) {
    if (e.code === "ARG_UNKNOWN_OPTION") {
      console.log(colors.red(invalidOption));
    } else {
      console.log(colors.red("エラーが発生しました"));
    }
    console.log(previewHelpText);
    return null;
  }
}

export const exec: cliCommand = async (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args["--help"]) {
    console.log(previewHelpText);
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
  }
};
