import fs from "fs-extra";
import matter from "gray-matter";
import { Profile } from "../../types";
import { throwWithConsoleError } from "../../utils/errors";

export function getProfile(): Profile {
  let profileFile;
  try {
    profileFile = fs.readFileSync("PROFILE.md", "utf8");
  } catch (e) {
    throwWithConsoleError("プロジェクトルートにPROFILE.mdを作成してください");
  }
  const { data, content } = matter(profileFile);
  return { content, ...data };
}
