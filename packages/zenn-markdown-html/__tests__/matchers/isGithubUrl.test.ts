import { isGithubUrl } from '../../src/utils/url-matcher';

describe('Testing isGithubUrl', () => {
  describe('If True is returned', () => {
    test('When the URL to the Github file', () => {
      const goodUrlList = [
        'https://github.com/owner-name/repo-name/blob/branch-name/file-path',
        'https://github.com/owner/repo.name/blob/branch-name/file-path',
      ];

      goodUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(true);
      });
    });

    test('When permalinks to Github files', () => {
      const goodUrlList = [
        'https://github.com/owner/repo/blob/362e2428248daabce3da74bef4c41b0879c15392/file-path',
      ];

      goodUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(true);
      });
    });

    test('When the URL to the Github file has a line number specification', () => {
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

  describe('If False is returned', () => {
    test('When not a URL to a Github file', () => {
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

    test('Incorrect owner or repository name', () => {
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

    test('should be contained XSS', () => {
      const badUrlList = [
        'https://github.com.example.com/owner-name/repo-name/blob/branch-name/file-path',
      ];

      badUrlList.forEach((url) => {
        expect(isGithubUrl(url)).toBe(false);
      });
    });
  });
});
