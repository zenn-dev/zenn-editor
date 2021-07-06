import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import * as Log from './log';
import fetch from 'node-fetch';

export function generateSlug(): string {
  return crypto.randomBytes(7).toString('hex');
}

export function getCurrentCliVersion() {
  return require('../../../package.json').version;
}

export async function getPublishedCliVersion() {
  const response = await fetch(`https://registry.npmjs.org/zenn-cli/latest`);
  const data: { version: string } = await response.json();
  const latest = data['version'];
  return latest;
}

export function getWorkingPath(pathFromWorkingDir: string): string {
  // Prevent directory traversal
  if (/^(\.\.(\/|\\|$))+/.test(path.normalize(pathFromWorkingDir))) {
    Log.error(
      '取得するファイル/ディレクトリの名前に不正な文字列が含まれているため処理を終了します'
    );
    process.exit(1);
  }
  // remove beginning slash
  return path.join(process.cwd(), pathFromWorkingDir.replace(/^\//, ''));
}

export function getFileRaw(fullpath: string) {
  try {
    const raw = fs.readFileSync(fullpath, 'utf8');
    return raw;
  } catch (err) {
    return null;
  }
}

export function getImageRaw(fullpath: string) {
  try {
    const raw = fs.readFileSync(fullpath);
    return raw;
  } catch (err) {
    return null;
  }
}

export function listDirnames(searchDirFullpath: string) {
  try {
    const allFiles = fs.readdirSync(searchDirFullpath, {
      withFileTypes: true,
    });
    return allFiles
      .filter((file) => file.isDirectory())
      .map(({ name }) => name);
  } catch (e) {
    return null;
  }
}

export function listDirnamesOrderByModified(searchDirFullpath: string) {
  const allDirnames = listDirnames(searchDirFullpath);
  if (!allDirnames) return allDirnames;

  return allDirnames
    .map((dirname) => {
      return {
        name: dirname,
        time: fs
          .statSync(path.join(searchDirFullpath, dirname))
          .mtime.getTime(),
      };
    })
    .sort((a, b) => b.time - a.time)
    .map(({ name }) => name);
}

export function listFilenames(searchDirFullpath: string) {
  try {
    const allFiles = fs.readdirSync(searchDirFullpath);
    return allFiles;
  } catch (e) {
    return null;
  }
}

export function listFilenamesOrderByModified(searchDirFullpath: string) {
  const allFiles = listFilenames(searchDirFullpath);
  if (!allFiles) return allFiles;
  return allFiles
    .map((filename) => {
      return {
        name: filename,
        time: fs
          .statSync(path.join(searchDirFullpath, filename))
          .mtime.getTime(),
      };
    })
    .sort((a, b) => b.time - a.time)
    .map(({ name }) => name);
}

export function getImageSize(fullpath: string): number {
  const stat = fs.statSync(fullpath);
  return stat.size;
}

export function bufferToDataURL(buffer: Buffer, mediaType: string): string {
  return `data:${mediaType};base64,${buffer.toString('base64')}`;
}

export function generateFileIfNotExist(fullpath: string, content: string) {
  fs.outputFileSync(
    fullpath,
    content,
    { flag: 'wx' } // Don't overwrite
  );
}
