import Express from 'express';
import fs from 'fs-extra';
import { getWorkingPath } from '../lib/helper';

export async function getLocalInfo(
  _req: Express.Request,
  res: Express.Response
) {
  const articleDirpath = getWorkingPath('articles');
  try {
    fs.readdirSync(articleDirpath);
    res.json({ hasInit: true });
  } catch (e) {
    res.json({ hasInit: false });
  }
}
