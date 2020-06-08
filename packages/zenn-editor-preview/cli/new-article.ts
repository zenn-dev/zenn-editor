import arg from "arg";
import { cliCommand } from ".";
import {
  generateSlug,
  validateSlug,
  getSlugErrorMessage,
} from "../utils/slug-helper";
import colors from "colors/safe";

export const exec: cliCommand = (argv) => {
  const args = arg(
    {
      "--slug": String,
    },
    { argv }
  );

  const slug = args["--slug"] || generateSlug();
  if (!validateSlug(slug)) {
    const errorMessage = getSlugErrorMessage(slug);
    console.error(colors.red(`エラー：${errorMessage}`));
    process.exit(1);
  }
  const fileName = colors.green(`${slug}.md`);
  console.log(`📄${fileName} created.`);
};
