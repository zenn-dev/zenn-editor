import path from "path";
const mkdirp = require("mkdirp");
import { cliCommand } from ".";

export const exec: cliCommand = (argv) => {
  const projectRoot = process.cwd();
  const mkDirNames = ["articles", "books"];

  mkDirNames.forEach((dirName) => {
    try {
      mkdirp.sync(path.join(projectRoot, dirName));
    } catch (e) {}
  });
  console.log(`
  🎉Done!
  早速コンテンツを作成しましょう

  👇新しい記事を作成する
  $ zenn add:article

  👇新しい本を作成する
  $ zenn add:book
  `);
};
