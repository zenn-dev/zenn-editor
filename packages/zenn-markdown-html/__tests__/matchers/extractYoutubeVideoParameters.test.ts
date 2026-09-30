import { describe, test, expect } from 'vitest';
import { extractYoutubeVideoParameters } from '../../src/utils/url-matcher';

describe('extractYoutubeVideoParametersのテスト', () => {
  const videoId = 'Xx0XXxXXXx0';

  test('videoIdを取得できる', () => {
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}`
      )
    ).toEqual({ videoId, start: undefined });
    expect(
      extractYoutubeVideoParameters(`https://youtu.be/${videoId}`)
    ).toEqual({ videoId, start: undefined });
  });

  test('秒数のみの t パラメータを取得できる', () => {
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=100`
      )
    ).toEqual({ videoId, start: '100' });
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=100s`
      )
    ).toEqual({ videoId, start: '100' });
  });

  test('時間・分・秒を含む t パラメータを秒に換算できる', () => {
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=1h2m3s`
      )
    ).toEqual({ videoId, start: '3723' });
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=2m3s`
      )
    ).toEqual({ videoId, start: '123' });
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=1h30m`
      )
    ).toEqual({ videoId, start: '5400' });
  });

  test('解釈できない t パラメータは start なしにする', () => {
    expect(
      extractYoutubeVideoParameters(
        `https://www.youtube.com/watch?v=${videoId}&t=abc`
      )
    ).toEqual({ videoId, start: undefined });
  });
});
