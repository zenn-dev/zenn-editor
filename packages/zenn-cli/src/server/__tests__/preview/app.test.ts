import { vi, describe, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import supertest from 'supertest';
import * as helper from '../../lib/helper';
import { createApp } from '../../app';
const app = createApp();
const fixturesRootPath = path.resolve(__dirname, '..', 'fixtures');

describe('/api/articles', () => {
  test('should respond with articles data in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/articles').expect(200);
    expect(res.body.articles).toHaveLength(2);
    expect(res.body.articles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'my-first-post',
          title: 'First',
          emoji: '📝',
          type: 'tech',
          topics: [],
          published: true,
        }),
        expect.objectContaining({
          slug: 'my-second-post',
          title: 'Second',
          emoji: '💯',
          type: 'idea',
          topics: ['zenn', 'cli'],
          published: false,
        }),
      ])
    );
  });

  test('should not include bodyHtml', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/articles').expect(200);
    expect(res.body.articles[0].bodyHtml).toBe(undefined);
  });

  test('should respond with empty array if no article exists in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(
      `${fixturesRootPath}/empty-directories`
    );
    const res = await supertest(app).get('/api/articles').expect(200);
    expect(res.body.articles).toEqual([]);
  });
});

describe('/api/articles/:slug', () => {
  test('should respond with the article data in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/articles/my-first-post')
      .expect(200);
    expect(res.body.article).toEqual(
      expect.objectContaining({
        slug: 'my-first-post',
        title: 'First',
        emoji: '📝',
        type: 'tech',
        topics: [],
        published: true,
        bodyHtml: expect.stringMatching(/<p.*>Hello!<\/p>/),
      })
    );
  });
});

describe('/api/books', () => {
  test('should respond with books data in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/books').expect(200);
    expect(res.body.books).toHaveLength(2);
    expect(res.body.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'my-first-book',
          title: 'First',
          summary: 'Hello!',
          topics: [],
          price: 0,
          published: true,
          specifiedChapterSlugs: ['example2', 'example1'],
          chapterOrderedByConfig: true,
        }),
        expect.objectContaining({
          slug: 'my-second-book',
          title: 'Second',
          summary: 'Hello, again!',
          topics: ['zenn', 'cli'],
          price: 500,
          published: false,
          chapterOrderedByConfig: false,
        }),
      ])
    );
  });

  test('should respond with empty array if no book exists in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(
      `${fixturesRootPath}/empty-directories`
    );
    const res = await supertest(app).get('/api/books').expect(200);
    expect(res.body.books).toEqual([]);
  });
});

describe('/api/books/:slug', () => {
  test('should respond with the book data in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-first-book')
      .expect(200);
    expect(res.body.book).toEqual(
      expect.objectContaining({
        slug: 'my-first-book',
        title: 'First',
        summary: 'Hello!',
        topics: [],
        price: 0,
        published: true,
        specifiedChapterSlugs: ['example2', 'example1'],
        chapterOrderedByConfig: true,
        coverFilesize: 1036,
        coverWidth: 25,
        coverHeight: 25,
        coverDataUrl: expect.stringMatching(/^data:image\/jpeg;base64,/),
      })
    );
  });
});

describe('/api/books/:book_slug/chapters', () => {
  test('should respond with chapters orderby specified on config.yaml', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-first-book/chapters')
      .expect(200);
    expect(res.body.chapters).toHaveLength(3);
    expect(res.body.chapters).toEqual([
      expect.objectContaining({
        slug: 'example2',
        filename: 'example2.md',
        title: 'title2',
        free: true,
        position: 0,
      }),
      expect.objectContaining({
        slug: 'example1',
        filename: 'example1.md',
        title: 'title1',
        position: 1,
      }),
      expect.objectContaining({
        slug: 'example3',
        filename: 'example3.md',
        title: 'title3',
        free: false,
        position: null, // example3 is not specified on config.yaml
      }),
    ]);
  });

  test('should respond with chapters orderby position specified on filename', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-second-book/chapters')
      .expect(200);
    expect(res.body.chapters).toHaveLength(3);
    expect(res.body.chapters).toEqual([
      expect.objectContaining({
        slug: 'hi',
        filename: '1.hi.md',
        title: 'title1',
        free: true,
        position: 1,
      }),
      expect.objectContaining({
        slug: 'hey',
        filename: '2.hey.md',
        title: 'title2',
        free: false,
        position: 2,
      }),
      expect.objectContaining({
        slug: 'invalid-slug',
        filename: 'invalid-slug.md',
        title: 'title3',
        free: false,
        position: null, // filename is not formatted with n.slug.md
      }),
    ]);
  });

  test('should not include bodyHtml', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-second-book/chapters')
      .expect(200);
    expect(res.body.chapters[0].bodyHtml).toBe(undefined);
  });

  test('should not include toc', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-second-book/chapters')
      .expect(200);
    expect(res.body.chapters[0].toc).toBe(undefined);
  });
});

describe('/api/books/:book_slug/chapters/:chapter_filename', () => {
  test('should respond with the chapter in cwd', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-first-book/chapters/example2.md')
      .expect(200);
    expect(res.body.chapter).toEqual(
      expect.objectContaining({
        slug: 'example2',
        filename: 'example2.md',
        title: 'title2',
        free: true,
        position: 0,
        bodyHtml: expect.stringMatching(/<p.*>Hello!<\/p>/),
      })
    );
  });

  test('should respond with the toc of the chapter', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-first-book/chapters/example1.md')
      .expect(200);
    expect(res.body.chapter.toc).toEqual([
      expect.objectContaining({
        level: 2,
        text: 'heading1',
        children: [
          expect.objectContaining({
            level: 3,
            text: 'heading1-1',
            children: [],
          }),
        ],
      }),
      expect.objectContaining({
        level: 2,
        text: 'heading2',
        children: [],
      }),
    ]);
  });

  test('should respond with chapters orderby position specified on filename', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-second-book/chapters')
      .expect(200);
    expect(res.body.chapters).toHaveLength(3);
    expect(res.body.chapters).toEqual([
      expect.objectContaining({
        slug: 'hi',
        filename: '1.hi.md',
        title: 'title1',
        free: true,
        position: 1,
      }),
      expect.objectContaining({
        slug: 'hey',
        filename: '2.hey.md',
        title: 'title2',
        free: false,
        position: 2,
      }),
      expect.objectContaining({
        slug: 'invalid-slug',
        filename: 'invalid-slug.md',
        title: 'title3',
        free: false,
        position: null, // filename is not formatted with n.slug.md
      }),
    ]);
  });
});

describe('/api/cli-version', () => {
  test('should respond with updateAvailable:true if current v differs from published v', async () => {
    vi.spyOn(helper, 'getPublishedCliVersion').mockResolvedValue('2.2.2'); // mock
    const res = await supertest(app).get('/api/cli-version').expect(200);
    expect(res.body.latest).toEqual('2.2.2');
    expect(res.body.current).toMatch(/^0\.[0-9.]+/);
    expect(res.body.updateAvailable).toBe(true);
  });

  test('should respond with updateAvailable:false if current v equals to published v', async () => {
    const actualCurrentVersion = helper.getCurrentCliVersion();
    if (!actualCurrentVersion) throw 'something wrong!';
    // mock getPublishedCliVersion to return the same version
    vi.spyOn(helper, 'getPublishedCliVersion').mockResolvedValue(
      actualCurrentVersion
    );
    const res = await supertest(app).get('/api/cli-version').expect(200);
    expect(res.body.latest).toEqual(actualCurrentVersion);
    expect(res.body.current).toMatch(actualCurrentVersion);
    expect(res.body.updateAvailable).toBe(false);
  });
});

describe('/api/local-info', () => {
  test('should respond with hasInit:true if article directory exists in cwd', async () => {
    // mock process.cwd()
    // articles directory must be located in fixtures dir
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/local-info').expect(200);
    expect(res.body.hasInit).toBe(true);
  });

  test('should respond with hasInit:false if article directory exists in cwd', async () => {
    // mock process.cwd()
    vi.spyOn(process, 'cwd').mockReturnValue(`${fixturesRootPath}/empty`);
    const res = await supertest(app).get('/api/local-info').expect(200);
    expect(res.body.hasInit).toBe(false);
  });
});

describe('/images/*', () => {
  test('should serve image files from images directory', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/images/test.jpg').expect(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  test('should handle URL encoded paths with %20 (spaces)', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const imagePathWithSpace = path.join(
      fixturesRootPath,
      'images',
      'test image.jpg'
    );
    const originalImagePath = path.join(fixturesRootPath, 'images', 'test.jpg');

    if (fs.existsSync(originalImagePath)) {
      fs.copyFileSync(originalImagePath, imagePathWithSpace);

      const res = await supertest(app)
        .get('/images/test%20image.jpg')
        .expect(200);
      expect(res.headers['content-type']).toMatch(/image/);

      // Clean up
      fs.unlinkSync(imagePathWithSpace);
    }
  });

  test('should return 404 for non-existent images', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    await supertest(app).get('/images/nonexistent.jpg').expect(404);
  });

  test('should serve images when cwd is under a dot-prefixed directory', async () => {
    const dotCwd = path.join(fixturesRootPath, '.dot-prefixed-cwd');
    const imagesDir = path.join(dotCwd, 'images');
    const targetImage = path.join(imagesDir, 'test.jpg');
    fs.copySync(path.join(fixturesRootPath, 'images'), imagesDir);

    try {
      vi.spyOn(process, 'cwd').mockReturnValue(dotCwd);
      const res = await supertest(app).get('/images/test.jpg').expect(200);
      expect(res.headers['content-type']).toMatch(/image/);
    } finally {
      fs.removeSync(dotCwd);
      expect(fs.existsSync(targetImage)).toBe(false);
    }
  });

  test('should return 404 for dotfiles inside the images directory', async () => {
    const hiddenImage = path.join(fixturesRootPath, 'images', '.secret.jpg');
    fs.copyFileSync(
      path.join(fixturesRootPath, 'images', 'test.jpg'),
      hiddenImage
    );

    try {
      vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
      await supertest(app).get('/images/.secret.jpg').expect(404);
    } finally {
      fs.unlinkSync(hiddenImage);
    }
  });

  test('should reject URL-encoded path traversal out of images directory', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get(
      '/images/..%2Farticles%2Fmy-first-post.md'
    );
    expect(res.status).not.toBe(200);
  });

  test('should reject double URL-encoded path traversal', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get(
      '/images/%2e%2e%2Farticles%2Fmy-first-post.md'
    );
    expect(res.status).not.toBe(200);
  });
});

describe('/files/*', () => {
  test('files ディレクトリの画像を返す', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/files/test.jpg').expect(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
  });

  test('files ディレクトリの音声を audio/mp4 で返す', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/files/test.m4a').expect(200);
    expect(res.headers['content-type']).toBe('audio/mp4');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('画像と音声以外の拡張子のファイルは返さない', async () => {
    const htmlPath = path.join(fixturesRootPath, 'files', 'page.html');
    fs.writeFileSync(htmlPath, '<p>test</p>');
    try {
      vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
      await supertest(app).get('/files/page.html').expect(404);
    } finally {
      fs.unlinkSync(htmlPath);
    }
  });

  test('ドットから始まる名前のファイルは返さない', async () => {
    const hiddenPath = path.join(fixturesRootPath, 'files', '.hidden.m4a');
    fs.copyFileSync(
      path.join(fixturesRootPath, 'files', 'test.m4a'),
      hiddenPath
    );
    try {
      vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
      await supertest(app).get('/files/.hidden.m4a').expect(404);
    } finally {
      fs.unlinkSync(hiddenPath);
    }
  });

  test('不正なパーセントエンコードは 400 を返す', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    await supertest(app).get('/files/%E6.m4a').expect(400);
    await supertest(app).get('/images/%E6.jpg').expect(400);
  });

  test('エンコードされた日本語のファイル名の音声を返す', async () => {
    const filepath = path.join(fixturesRootPath, 'files', '日本語.m4a');
    fs.copyFileSync(path.join(fixturesRootPath, 'files', 'test.m4a'), filepath);
    try {
      vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
      await supertest(app)
        .get('/files/%E6%97%A5%E6%9C%AC%E8%AA%9E.m4a')
        .expect(200);
    } finally {
      fs.unlinkSync(filepath);
    }
  });

  test('存在しないファイルは 404 を返し、index.html にフォールバックしない', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    await supertest(app)
      .get('/files/nonexistent.m4a')
      .set('Accept', 'text/html')
      .expect(404);
  });

  test.each([
    ['パスの遡り', '/files/../package.json'],
    ['エンコードされたパスの遡り', '/files/..%2Farticles%2Fmy-first-post.md'],
    [
      'ドットもエンコードされたパスの遡り',
      '/files/%2e%2e%2Farticles%2Fmy-first-post.md',
    ],
    ['images ディレクトリへの遡り', '/files/..%2Fimages%2Ftest.jpg'],
  ])('%sではファイルを返さない', async (_name, url) => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get(url);
    expect(res.status).not.toBe(200);
  });

  test('images ディレクトリのファイルは /files では返さない', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    await supertest(app).get('/files/test-1036bytes.jpg').expect(404);
  });
});
