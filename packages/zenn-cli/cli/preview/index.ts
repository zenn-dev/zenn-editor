import arg from "arg";
import { cliCommand } from "..";
import { build } from "./build";
import chokidar from "chokidar";
import socketIo from "socket.io";
import { invalidOption, previewHelpText } from "../constants";
import colors from "colors/safe";

type Options = {
  port: number;
  shouldWatch: boolean;
};

export const exec: cliCommand = async (argv) => {
  const options: Options = { shouldWatch: false, port: 8000 };
  try {
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

    // Show help text and return if required.
    const help = args["--help"];
    if (help) {
      console.log(previewHelpText);
      return;
    }

    options.port = args["--port"] || 8000;
    options.shouldWatch = !args["--no-watch"];
  } catch (e) {
    if (e.code === "ARG_UNKNOWN_OPTION") {
      console.log(colors.red(invalidOption));
      return;
    }
  }

  const { port, shouldWatch } = options;
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
