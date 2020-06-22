import path from "path";
import fs from "fs-extra";
import arg from "arg";
import { cliCommand } from ".";
import {
  generateSlug,
  validateSlug,
  getSlugErrorMessage,
} from "../utils/slug-helper";
import colors from "colors/safe";

const generatePlaceholderChapters = (bookDirPath: string): void => {
  const chapterBody = ["---", 'title: ""', "---"].join("\n") + "\n";
  ["1.md", "2.md", "3.md"].forEach((chapterFileName) => {
    try {
      fs.writeFileSync(
        path.join(bookDirPath, chapterFileName),
        chapterBody,
        { flag: "wx" } // Don't overwrite
      );
      console.log(`Chapter 📄${colors.green(chapterFileName)} created.`);
    } catch (e) {
      console.log(colors.red("チャプターファイルの作成時にエラーが発生") + e);
    }
  });
};

export const exec: cliCommand = (argv) => {
  const args = arg(
    {
      "--slug": String,
      "--title": String,
      "--published": String,
      "--summary": String,
      "--price": Number,
    },
    { argv }
  );

  const slug = args["--slug"] || generateSlug();
  if (!validateSlug(slug)) {
    const errorMessage = getSlugErrorMessage(slug);
    console.error(colors.red(`エラー：${errorMessage}`));
    process.exit(1);
  }
  const bookDirPath = path.join(process.cwd(), "books", slug);
  try {
    fs.mkdirpSync(bookDirPath);
  } catch (e) {
    // already exist => do nothing
  }
  const title = args["--title"] || "";
  const summary = args["--summary"] || "";
  const published = args["--published"] === "true" ? "true" : "false"; // デフォルトはfalse
  const price = args["--price"] || 0; // デフォルトはfalse

  const configYamlBody =
    [
      `title: "${title}"`,
      `summary: "${summary}"`,
      "topics: []",
      `published: ${published}`,
      `price: ${price} # 有料の場合200〜5000`,
    ].join("\n") + "\n";

  const configYamlPath = path.join(bookDirPath, "config.yaml");

  try {
    fs.writeFileSync(
      configYamlPath,
      configYamlBody,
      { flag: "wx" } // Don't overwrite
    );
    console.log(`🛠${colors.green(`books/${slug}/config.yaml`)} created.`);
  } catch (e) {
    console.log(colors.red("エラーが発生しました") + e);
    process.exit(1);
  }
  generatePlaceholderChapters(bookDirPath);
};
