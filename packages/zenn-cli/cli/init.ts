import path from "path";
import fs from "fs-extra";

import { cliCommand } from ".";

export const exec: cliCommand = () => {
  const projectRoot = process.cwd();
  const mkDirNames = ["articles", "books"];

  mkDirNames.forEach((dirName) => {
    try {
      fs.mkdirpSync(path.join(projectRoot, dirName));
      fs.writeFileSync(
        path.join(projectRoot, dirName, ".keep"),
        "",
        { flag: "wx" } // Don't overwrite
      );
    } catch (e) {
      console.log(`Generating ${dirName} skipped.`);
    }
  });

  // generate .gitignore
  try {
    fs.writeFileSync(
      path.join(projectRoot, ".gitignore"),
      ["node_modules", ".DS_Store"].join("\n"),
      { flag: "wx" } // Don't overwrite
    );
  } catch (e) {
    console.log(`Generating .gitignore skipped.`);
  }

  // generate README.md
  try {
    fs.writeFileSync(
      path.join(projectRoot, "README.md"),
      [
        "# Zenn Contents\n\n",
        "[✍️ How to use](https://zenn.dev/zenn/articles/zenn-cli-guide)",
      ].join(""),
      { flag: "wx" } // Don't overwrite
    );
  } catch (e) {
    console.log(`Generating README.md skipped.`);
  }

  console.log(`
  🎉Done!
  早速コンテンツを作成しましょう

  👇新しい記事を作成する
  $ zenn new:article

  👇新しい本を作成する
  $ zenn new:book

  👇表示をプレビューする
  $ zenn preview
  `);
};
