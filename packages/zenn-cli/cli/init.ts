import path from "path";
import fs from "fs-extra";

import { cliCommand } from ".";

export const exec: cliCommand = (argv) => {
  const projectRoot = process.cwd();
  const mkDirNames = ["articles", "books"];

  mkDirNames.forEach((dirName) => {
    try {
      fs.mkdirpSync(path.join(projectRoot, dirName));
    } catch (e) {}
  });

  // generate .gitignore
  try {
    fs.writeFileSync(
      path.join(process.cwd(), ".gitignore"),
      ["node_modules", ".DS_Store"].join("\n"),
      { flag: "wx" } // Don't overwrite
    );
  } catch (e) {}

  console.log(`
  🎉Done!
  早速コンテンツを作成しましょう

  👇新しい記事を作成する
  $ zenn new:article

  👇新しい本を作成する
  $ zenn new:book
  `);
};
