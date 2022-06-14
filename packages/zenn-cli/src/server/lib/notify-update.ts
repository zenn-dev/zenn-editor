import boxen from 'boxen';
import colors from 'colors';
import Configstore from 'configstore';
import { getCurrentCliVersion, getPublishedCliVersion } from './helper';

/** zenn-cli が更新されたか確認するまでの猶予期間 ( 12時間 ) */
export const CLI_UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 12;

/** zenn-cli のアップデートが必要なら、アップデートを促すアラートを cli に表示する */
export async function notifyNeedUpdateCLI() {
  const config = new Configstore('zenn-cli', { lastUpdateCheck: Date.now() });

  // 一日前にチェックしていれば何も表示しない
  if (Date.now() - config.get('lastUpdateCheck') < CLI_UPDATE_CHECK_INTERVAL) {
    return;
  }

  const currentVersion = getCurrentCliVersion();
  const publishedVersion = await getPublishedCliVersion();

  // zenn-cli のアップデートが必要なら、アップデートを促すアラートを cli に表示する
  if (currentVersion !== publishedVersion) {
    console.log(
      boxen(
        [
          // prettier-ignore
          `新しいバージョンがリリースされています: ${colors.grey(currentVersion)} → ${colors.green(publishedVersion)}`,
          `${colors.cyan('npm install zenn-cli@latest')} で更新してください`,
        ].join('\n'),
        {
          padding: 1,
          margin: 1,
          align: 'left',
          borderColor: 'yellow',
          borderStyle: 'round',
        }
      )
    );
  }

  // チェックした日付を保存する
  config.set('lastUpdateCheck', Date.now());
}
