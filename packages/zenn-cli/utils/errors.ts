import colors from "colors/safe";

export const throwWithConsoleError = (message: string) => {
  const errorMessage = `${colors.red("エラー")} ${message}`;
  if (process.env.NODE_ENV === "production") {
    // TODO: 現状コンソールのエラーメッセージがStackTraceで埋もれないように以下のようにしているがなんとかしたい
    console.error(errorMessage);
    throw "";
  }

  throw new Error(errorMessage);
};

export const consoleNotice = (message: string) => {
  console.log(`${colors.yellow("警告")} ${message}`);
};
