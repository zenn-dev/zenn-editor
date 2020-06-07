import arg from "arg";

// Special thanks to vercel/next.js for great examples.
export type cliCommand = (argv?: string[]) => void;

const commands: { [command: string]: () => Promise<cliCommand> } = {
  preview: async () =>
    await import("./zenn-preview").then((i) => i.zennPreview),
};

const args = arg({});

const command = args?.[0] || "preview";

if (!commands[command]) {
  console.error("No CLI command fround...");
  process.exit(1);
}

commands[command]().then((exec) => exec(args[0]));
