import arg from "arg";
import colors from "colors/safe";

// Special thanks to vercel/next.js for great examples.
export type cliCommand = (argv?: string[]) => void;

const commands: { [command: string]: () => Promise<cliCommand> } = {
  preview: async () => await import("./preview").then((i) => i.exec),
  help: async () => await import("./help").then((i) => i.exec),
  init: async () => await import("./init").then((i) => i.exec),
};

const args = arg(
  {},
  {
    permissive: true,
  }
);
const command = args._[0] || "preview";

if (!commands[command]) {
  console.log(
    colors.red(
      '😿該当するCLIコマンドが存在しません。コマンド一覧は"zenn help"で確認できます'
    )
  );
  process.exit(1);
}

commands[command]().then((exec) => exec(args._.slice(1)));
