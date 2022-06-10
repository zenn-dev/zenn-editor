import path from 'path';
import supertest from 'supertest';
import * as helper from '../../lib/helper';
import { createApp } from '../../app';
const app = createApp();
const fixturesRootPath = path.resolve(__dirname, '..', 'fixtures');

describe('/api/articles', () => {
  test('should respond with articles data in cwd', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/articles').expect(200);
    expect(res.body.articles[0].bodyHtml).toBe(undefined);
  });

  test('should respond with empty array if no article exists in cwd', async () => {
    jest
      .spyOn(process, 'cwd')
      .mockReturnValue(`${fixturesRootPath}/empty-directories`);
    const res = await supertest(app).get('/api/articles').expect(200);
    expect(res.body.articles).toEqual([]);
  });
});

describe('/api/articles/:slug', () => {
  test('should respond with the article data in cwd', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
        bodyHtml: expect.stringContaining('<p>Hello!</p>'),
      })
    );
  });
});

describe('/api/books', () => {
  test('should respond with books data in cwd', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest
      .spyOn(process, 'cwd')
      .mockReturnValue(`${fixturesRootPath}/empty-directories`);
    const res = await supertest(app).get('/api/books').expect(200);
    expect(res.body.books).toEqual([]);
  });
});

describe('/api/books/:slug', () => {
  test('should respond with the book data in cwd', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app)
      .get('/api/books/my-second-book/chapters')
      .expect(200);
    expect(res.body.chapters[0].bodyHtml).toBe(undefined);
  });
});

describe('/api/books/:book_slug/chapters/:chapter_filename', () => {
  test('should respond with the chapter in cwd', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
        bodyHtml: expect.stringContaining('<p>Hello!</p>'),
      })
    );
  });

  test('should respond with chapters orderby position specified on filename', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
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
    jest.spyOn(helper, 'getPublishedCliVersion').mockResolvedValue('2.2.2'); // mock
    const res = await supertest(app).get('/api/cli-version').expect(200);
    expect(res.body.latest).toEqual('2.2.2');
    expect(res.body.current).toMatch(/^0\.[0-9.]+/);
    expect(res.body.updateAvailable).toBe(true);
  });

  test('should respond with updateAvailable:false if current v equals to published v', async () => {
    const actualCurrentVersion = helper.getCurrentCliVersion();
    if (!actualCurrentVersion) throw 'something wrong!';
    // mock getPublishedCliVersion to return the same version
    jest
      .spyOn(helper, 'getPublishedCliVersion')
      .mockResolvedValue(actualCurrentVersion);
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
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesRootPath);
    const res = await supertest(app).get('/api/local-info').expect(200);
    expect(res.body.hasInit).toBe(true);
  });

  test('should respond with hasInit:false if article directory exists in cwd', async () => {
    // mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue(`${fixturesRootPath}/empty`);
    const res = await supertest(app).get('/api/local-info').expect(200);
    expect(res.body.hasInit).toBe(false);
  });
});
