import arg from "arg";

// Special thanks to vercel/next.js for great examples.
export type cliCommand = (argv?: string[]) => void;

const commands: { [command: string]: () => Promise<cliCommand> } = {
  preview: async () =>
    await import("./zenn-preview").then((i) => i.zennPreview),
};

const args = arg({});
const command = args._[0] || "preview";

if (!commands[command]) {
  console.error("😿CLIコマンドが見つかりませんでした");
  process.exit(1);
}

commands[command]().then((exec) => exec(args._.slice(1)));
