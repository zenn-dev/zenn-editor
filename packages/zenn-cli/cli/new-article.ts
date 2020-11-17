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

type Options = {
  slug: string;
  title: string;
  type: string;
  emoji: string;
  published: string;
};

export const exec: cliCommand = (argv) => {
  const options: Options = {
    emoji: "",
    published: "",
    slug: "",
    title: "",
    type: "",
  };
  try {
    const args = arg(
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

    // Show help text and return if required.
    const help = args["--help"];
    if (help) {
      console.log(newArticleHelpText);
      return;
    }

    options.slug = args["--slug"] || generateSlug();
    options.title = args["--title"] || "";
    options.emoji = args["--emoji"] || pickRandomEmoji();
    options.type = args["--type"] === "idea" ? "idea" : "tech";
    options.published = args["--published"] === "true" ? "true" : "false"; // デフォルトはfalse
  } catch (e) {
    if (e.code === "ARG_UNKNOWN_OPTION") {
      console.log(colors.red(invalidOption));
      return;
    }
  }

  const { slug, title, emoji, type, published } = options;
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
