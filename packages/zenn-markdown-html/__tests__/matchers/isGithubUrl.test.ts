import { isGithubUrl } from '../../src/utils/helper';

describe('isGithubUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('GithubファイルへのURLの時', () => {
      const goodUrlList = [
        'https://github.com/owner-name/repo-name/blob/branch-name/file-path',
        'https://github.com/owner/repo.name/blob/branch-name/file-path',
      ];

      goodUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(true);
      });
    });

    test('Githubファイルへのパーマリンクの時', () => {
      const goodUrlList = [
        'https://github.com/owner/repo/blob/362e2428248daabce3da74bef4c41b0879c15392/file-path',
      ];

      goodUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(true);
      });
    });

    test('GithubファイルへのURLに行数指定がある時', () => {
      const goodUrlList = [
        'https://github.com/owner-name/repo-name/blob/branch-name/file-path#L100',
        'https://github.com/owner-name/repo-name/blob/branch-name/file-path#L10-L100',
        'https://github.com/owner/repo/blob/362e2428248daabce3da74bef4c41b0879c15392/file-path#L100',
        'https://github.com/owner/repo/blob/362e2428248daabce3da74bef4c41b0879c15392/file-path#L10-L100',
      ];

      goodUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(true);
      });
    });
  });

  describe('Falseを返す場合', () => {
    test('GithubファイルへのURLでは無い時', () => {
      const badUrlList = [
        'bad-string',
        'https://example.com',
        'http://github.com/',
        'https://github.com/owner-name/repo-name',
        'https://github.com:3000/owner-name/repo-name/blob/branch-name/file-path',
      ];

      badUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(false);
      });
    });

    test('オーナー名またはリポジトリ名が正しく無い時', () => {
      const badOwnerNames = ['.owner', '-owner', 'owner.name'];
      const badRepoNames = ['.repo', '-repo'];

      badOwnerNames.forEach((owner) => {
        expect(
          isGithubUrl(`https://github.com/${owner}/repo/blob/branch/files`)
        ).toBe(false);
      });

      badRepoNames.forEach((repo) => {
        expect(
          isGithubUrl(`https://github.com/owner/${repo}/blob/branch/files`)
        ).toBe(false);
      });
    });

    test('XSSを含んでいる時', () => {
      const badUrlList = [
        'https://github.com.example.com/owner-name/repo-name/blob/branch-name/file-path',
      ];

      badUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(false);
      });
    });
  });
});
