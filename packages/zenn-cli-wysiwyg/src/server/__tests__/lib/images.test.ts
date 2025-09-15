import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { uploadImageMiddleware } from '../../lib/images';
import { postImage } from '../../api/images';

const app = express();

// ルートを設定
app.post('/api/images/:slug', uploadImageMiddleware, postImage);

const testImagePath = path.resolve(
  __dirname,
  '..',
  'fixtures',
  'images',
  'test.jpg'
);

const tempSlug = '___test-article___';
const tempDir = path.resolve('images', tempSlug);

describe('uploadImageMiddleware のテスト', () => {
  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirsSync(tempDir);
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('有効なslugと画像ファイルでアップロードが成功する', async () => {
    const response = await request(app)
      .post(`/api/images/${tempSlug}`)
      .attach('image', testImagePath)
      .expect(200);

    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toMatch(
      /^\/images\/___test-article___\/[a-f0-9-]+\.jpg$/
    );

    // ファイルが実際に保存されていることを確認
    expect(fs.existsSync(tempDir)).toBe(true);

    const files = fs.readdirSync(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^[a-f0-9-]+\.jpg$/);
  });

  test('無効なslugの場合は400エラーを返す', async () => {
    const invalidSlug = 'a'; // 1文字は無効

    const response = await request(app)
      .post(`/api/images/${invalidSlug}`)
      .attach('image', testImagePath)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('slugの値');
    expect(response.body.message).toContain('が不正です');
  });

  test('画像ファイル以外をアップロードした場合は400エラーを返す', async () => {
    const slug = 'test-article';
    const textFilePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(textFilePath, 'test content');

    const response = await request(app)
      .post(`/api/images/${slug}`)
      .attach('image', textFilePath)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Only image files are allowed!');
  });

  test('ファイルが添付されていない場合は400エラーを返す', async () => {
    const slug = 'test-article';

    const response = await request(app).post(`/api/images/${slug}`).expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('No file uploaded');
  });
});
