import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";

type ExecArgs = {
  srcDir: string;
  port: number;
  previewUrl: string;
};

export const build = async ({
  srcDir,
  port,
  previewUrl,
}: ExecArgs): Promise<Server> => {
  const app = next({ dev: false, dir: srcDir, conf: {} });
  const handle = app.getRequestHandler();
  await app.prepare();
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const requestUrl = req.url;
      if (!requestUrl) {
        return console.error("Undefined request url");
      }
      const parsedUrl = parse(requestUrl, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err?: any) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`👀Preview on ${previewUrl}`);
      resolve(server);
    });
  });
};
