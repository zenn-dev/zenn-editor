import url from 'url';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { networkInterfaces } from 'os';
import * as Log from './log';
import pkg from '../../../package.json';

export function generateSlug(): string {
  return crypto.randomBytes(7).toString('hex');
}

export function getCurrentCliVersion() {
  return pkg.version;
}

export async function getPublishedCliVersion() {
  const response = await fetch(`https://registry.npmjs.org/zenn-cli/latest`);
  const data: { version: string } = await response.json();
  const latest = data['version'];
  return latest;
}

export function getWorkingPath(pathFromWorkingDir: string): string {
  // Prevent directory traversal
  if (/\.\./.test(pathFromWorkingDir)) {
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
          .ctime.getTime(),
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
          .ctime.getTime(),
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

export function completeHtml(html: string): string {
  const $ = cheerio.load(html);
  $('img').map((i, el) => {
    const src = el.attribs['src'];
    // srcがURLの場合はチェックしない
    if (isUrl(src)) return;

    // 先頭が `/images/` であること
    if (!path.isAbsolute(src)) {
      $(el).before(
        `<p style="color: var(--c-error); font-weight: 700"><code>${src}</code>を表示できません。ローカルの画像を読み込むには相対パスではなく<code>/images/example.png</code>のように<code>/images/</code>から始まるパスを指定してください。</p>`
      );
      $(el).remove();
      return;
    }

    // 拡張子が png,jpg,jpeg,gif であること
    if (!src.match(/(.png|.jpg|.jpeg|.gif)$/)) {
      $(el).before(
        `<p style="color: var(--c-error); font-weight: 700"><code>${src}</code>を表示できません。対応している画像の拡張子は <code>png, jpg, jpeg, gif</code> です。</p>`
      );
      $(el).remove();
      return;
    }

    const filepath = getWorkingPath(src);

    if (!fs.existsSync(filepath)) {
      $(el).before(
        `<p style="color: var(--c-error); font-weight: 700"><code>${src}</code>にファイルが存在しません。</p>`
      );
      $(el).remove();
      return;
    }

    const fileSize = fs.statSync(filepath).size;
    if (fileSize > 1024 * 1024 * 3) {
      $(el).before(
        `<p style="color: var(--c-error); font-weight: 700"><code>${src}</code>のファイルサイズ（${
          Math.trunc((fileSize * 100) / 1024 / 1024) / 100
        } MB）はアップロード可能なサイズを超えています。ファイルサイズは3MB以内にしてください。</p>`
      );
      $(el).remove();
      return;
    }
  });

  return $.html();
}

function isUrl(text: string): boolean {
  try {
    return new url.URL(text) && true;
  } catch {
    return false;
  }
}

export const getLocalIPAddress = (): string | undefined => {
  const interfaces = networkInterfaces();
  const networks = Object.values(interfaces).flatMap((v) => v ?? []);

  for (const detail of networks) {
    if (detail.family === 'IPv4' && detail.address !== '127.0.0.1') {
      return detail.address;
    }
  }
};

export const resolveHostname = (
  hostname?: string
): { name: string; host?: string } => {
  let name = 'localhost';
  let host = hostname;

  if (hostname) {
    if (hostname !== '0.0.0.0' && hostname !== '::') {
      name = hostname;
    } else {
      host = getLocalIPAddress();
    }
  }

  return { name, host };
};
