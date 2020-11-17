import path from "path";
import fs from "fs-extra";
import arg from "arg";
import { cliCommand } from ".";
import {
  generateSlug,
  validateSlug,
  getSlugErrorMessage,
} from "../utils/shared/slug-helper";
import colors from "colors/safe";
import { invalidOption, newArticleHelpText } from "./constants";

const pickRandomEmoji = () => {
  // prettier-ignore
  const emojiList =["😺","📘","📚","📑","😊","😎","👻","🤖","😸","😽","💨","💬","💭","👋", "👌","👏","🙌","🙆","🐕","🐈","🦁","🐷","🦔","🐥","🐡","🐙","🍣","🕌","🌟","🔥","🌊","🎃","✨","🎉","⛳","🔖","📝","🗂","📌"]
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};


function parseArgs(argv: string[]) {
  try {
    return arg(
      {
        // Types
        "--slug": String,
        "--title": String,
        "--type": String,
        "--emoji": String,
        "--published": String,
        "--help": Boolean,
        // Alias
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
    console.log(newArticleHelpText);
    return null;
  }
}

export const exec: cliCommand = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args["--help"]) {
    console.log(newArticleHelpText);
    return;
  }

  const slug = args["--slug"] || generateSlug();
  const title = args["--title"] || "";
  const emoji = args["--emoji"] || pickRandomEmoji();
  const type = args["--type"] === "idea" ? "idea" : "tech";
  const published = args["--published"] === "true" ? "true" : "false"; // デフォルトはfalse

  if (!validateSlug(slug)) {
    const errorMessage = getSlugErrorMessage(slug);
    console.error(colors.red(`エラー：${errorMessage}`));
    process.exit(1);
  }

  const fileName = `${slug}.md`;
  const filePath = path.join(process.cwd(), "articles", fileName);

  const fileBody =
    [
      "---",
      `title: "${title}"`,
      `emoji: "${emoji}"`,
      `type: "${type}" # tech: 技術記事 / idea: アイデア`,
      "topics: []",
      `published: ${published}`,
      "---",
    ].join("\n") + "\n";

  try {
    fs.writeFileSync(
      filePath,
      fileBody,
      { flag: "wx" } // Don't overwrite
    );
    console.log(`📄${colors.green(fileName)} created.`);
  } catch (e) {
    console.log(colors.red("エラーが発生しました") + e);
  }
};
