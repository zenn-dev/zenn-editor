import * as helper from '../../lib/helper';
import {
  CLI_UPDATE_CHECK_INTERVAL,
  notifyNeedUpdateCLI,
} from '../../lib/notify-update';

const localVersion = 'v0.0.1';
const publishedVersion = 'v0.0.2';

const configGetMock = jest.fn();

jest.mock(
  'configstore',
  () =>
    function () {
      return {
        set: () => void 0,
        get: configGetMock.mockReturnValue(0),
      };
    }
);

describe('Testing the CLI update notification', () => {
  let consoleLogMock: jest.SpyInstance;
  let getCurrentCliVersionMock: jest.SpyInstance;
  let getPublishedCliVersionMock: jest.SpyInstance;

  beforeEach(() => {
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
    getCurrentCliVersionMock = jest
      .spyOn(helper, 'getCurrentCliVersion')
      .mockReturnValue(localVersion);
    getPublishedCliVersionMock = jest
      .spyOn(helper, 'getPublishedCliVersion')
      .mockResolvedValue(publishedVersion);
  });

  test('should display alert if the published version is different from the local version', async () => {
    await notifyNeedUpdateCLI();

    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringContaining('新しいバージョンがリリースされています')
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringContaining(localVersion)
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      expect.stringContaining(publishedVersion)
    );
  });

  test('should not display alert, if local and published versions are the same', async () => {
    getCurrentCliVersionMock.mockReturnValueOnce('v0.0.0');
    getPublishedCliVersionMock.mockResolvedValueOnce('v0.0.0');

    await notifyNeedUpdateCLI();

    expect(consoleLogMock).not.toBeCalled();
  });

  test('should not be shown again until a certain amount of time has passed, if Once an alert is displayed', async () => {
    await notifyNeedUpdateCLI();
    expect(consoleLogMock).toBeCalled();

    // 現在時刻を設定
    configGetMock.mockReturnValueOnce(Date.now());
    await notifyNeedUpdateCLI();
    expect(consoleLogMock).toBeCalledTimes(1);

    // 一定時間経過後の値を設定
    configGetMock.mockReturnValueOnce(
      Date.now() - CLI_UPDATE_CHECK_INTERVAL - 1
    );
    await notifyNeedUpdateCLI();
    expect(consoleLogMock).toBeCalledTimes(2);
  });
});
