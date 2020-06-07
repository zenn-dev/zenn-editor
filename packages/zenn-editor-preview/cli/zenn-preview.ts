import { createServer } from "http";
import { parse } from "url";
import next from "next";
import arg from "arg";

import { cliCommand } from ".";

export const zennPreview: cliCommand = (argv) => {
  const args = arg(
    {
      // Types
      "--port": Number,

      // Alias
      "-p": "--port",
    },
    { argv }
  );
  const port = args["--port"] || 3003;
  const previewUrl = `http://localhost:${port}`;

  const srcDir = `${__dirname}/../../.`; // refer project root from dist/cli/zenn-preview.js
  const app = next({ dev: false, dir: srcDir, conf: {} });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err?: any) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`✨Preview on ${previewUrl}`);
    });
  });
};
