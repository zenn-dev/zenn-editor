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

const pickRandomEmoji = () => {
  // prettier-ignore
  const emojiList =["😺","📘","📚","📑","😊","😎","👻","🤖","😸","😽","💨","💬","💭","👋", "👌","👏","🙌","🙆","🐕","🐈","🦁","🐷","🦔","🐥","🐡","🐙","🍣","🕌","🌟","🔥","🌊","🎃","✨","🎉","⛳","🔖","📝","🗂","📌"]
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};

export const exec: cliCommand = (argv) => {
  const args = arg(
    {
      "--slug": String,
      "--title": String,
      "--type": String,
      "--emoji": String,
      "--published": String,
    },
    { argv }
  );

  const slug = args["--slug"] || generateSlug();
  if (!validateSlug(slug)) {
    const errorMessage = getSlugErrorMessage(slug);
    console.error(colors.red(`エラー：${errorMessage}`));
    process.exit(1);
  }
  const fileName = `${slug}.md`;
  const filePath = path.join(process.cwd(), "articles", fileName);
  const title = args["--title"] || "";
  const emoji = args["--emoji"] || pickRandomEmoji();
  const type = args["--type"] === "idea" ? "idea" : "tech";
  const published = args["--published"] === "false" ? "false" : "true"; // デフォルトはtrue

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
