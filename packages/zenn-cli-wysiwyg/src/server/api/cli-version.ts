import Express from 'express';
import { getCurrentCliVersion, getPublishedCliVersion } from '../lib/helper';

export async function getCliVersion(
  _req: Express.Request,
  res: Express.Response
) {
  try {
    const latest = await getPublishedCliVersion();
    if (!latest) throw "Couldn't get latest version";
    const current = getCurrentCliVersion();
    if (!current) throw "Couldn't get current version";
    const updateAvailable = latest !== current;
    res.json({ current, latest, updateAvailable });
  } catch (err) {
    res
      .status(500)
      .json({ message: '最新のzenn-cliのバージョンを取得できませんでした' });
  }
}
