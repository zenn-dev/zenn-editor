import fs from "fs";
import path from "path";

const isDir = (checkPath) => {
  const stat = fs.statSync(getFullPath(checkPath));
  return stat.isDirectory();
};

const getFullPath = (dirName: string): string => {
  return path.join(process.cwd(), dirName);
};

export const getCwdList = (dirName: string): string[] => {
  return fs.readdirSync(getFullPath(dirName));
};

export const getCwdDirNames = (dirName: string): string[] => {
  return getCwdList(dirName)?.filter((f) => isDir(`${dirName}/${f}`));
};

export const getCwdMdNames = (dirName: string): string[] => {
  const regex = /\.md$/;
  return getCwdList(dirName)?.filter((f) => f.match(regex));
};
